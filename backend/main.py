import os
import shutil
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageFile
from rembg import remove
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input

# Safety fixes
ImageFile.LOAD_TRUNCATED_IMAGES = True
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = FastAPI()

# Enable CORS so Next.js (port 3000) can talk to Python (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MedicinalLeafPredictor:
    def __init__(self, model_path):
        print("🔄 Loading model...")
        self.model = load_model(model_path, compile=False)
        # self.model.build((None, 224, 224, 3)) # Often not needed if loading from .keras, but kept if you prefer
        
        # Your exact 80 classes
        self.class_names = ['Aloevera', 'Amla', 'Amruthaballi', 'Arali', 'Astma_weed', 'Badipala', 'Balloon_Vine', 
                           'Bamboo', 'Beans', 'Betel', 'Bhrami', 'Bringaraja', 'Caricature', 'Castor', 
                           'Catharanthus', 'Chakte', 'Chilly', 'Citron lime (herelikai)', 'Coffee', 
                           'Common rue(naagdalli)', 'Coriender', 'Curry', 'Doddpathre', 'Drumstick', 'Ekka', 
                           'Eucalyptus', 'Ganigale', 'Ganike', 'Gasagase', 'Ginger', 'Globe Amarnath', 'Guava', 
                           'Henna', 'Hibiscus', 'Honge', 'Insulin', 'Jackfruit', 'Jasmine', 'Kambajala', 
                           'Kasambruga', 'Kohlrabi', 'Lantana', 'Lemon', 'Lemongrass', 'Malabar_Nut', 
                           'Malabar_Spinach', 'Mango', 'Marigold', 'Mint', 'Neem', 'Nelavembu', 'Nerale', 
                           'Nooni', 'Onion', 'Padri', 'Palak(Spinach)', 'Papaya', 'Parijatha', 'Pea', 'Pepper', 
                           'Pomoegranate', 'Pumpkin', 'Raddish', 'Rose', 'Sampige', 'Sapota', 'Seethaashoka', 
                           'Seethapala', 'Spinach1', 'Tamarind', 'Taro', 'Tecoma', 'Thumbe', 'Tomato', 'Tulsi', 
                           'Turmeric', 'ashoka', 'camphor', 'kamakasturi', 'kepala']
        print(f"✅ Model loaded! {len(self.class_names)} classes ready")
    
    def resize_with_padding(self, img, target_size=(224, 224)):
        """EXACT copy from your dataset preprocessing"""
        original_w, original_h = img.size
        target_w, target_h = target_size
        
        scale = min(target_w / original_w, target_h / original_h)
        new_w = int(original_w * scale)
        new_h = int(original_h * scale)
        
        # ✅ EXACT: BILINEAR from dataset
        resized = img.resize((new_w, new_h), Image.BILINEAR)
        
        padded = Image.new("RGB", target_size, (0, 0, 0))
        paste_x = (target_w - new_w) // 2
        paste_y = (target_h - new_h) // 2
        
        padded.paste(resized, (paste_x, paste_y))
        return padded
    
    def preprocess_image_exact_dataset(self, img_path):
        """🚀 EXACT replica of your dataset preprocessing pipeline"""
        # 1. Load image
        image = Image.open(img_path).convert("RGBA")
        image.load()
        
        # 2. Remove background
        removed_bg = remove(image)
        
        # 3. Force black background
        black_bg = Image.new("RGBA", removed_bg.size, (0, 0, 0, 255))
        merged = Image.alpha_composite(black_bg, removed_bg).convert("RGB")
        
        # 4. Crop to object
        np_img = np.array(merged)
        mask = np.any(np_img != [0, 0, 0], axis=-1)
        coords = np.column_stack(np.where(mask))
        
        if coords.size == 0:
            raise ValueError("No plant detected after background removal")
        
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        
        # ✅ EXACT: 10px padding
        pad = 10
        cropped = merged.crop((
            max(0, x_min-pad), 
            max(0, y_min-pad), 
            min(merged.width, x_max+pad), 
            min(merged.height, y_max+pad)
        ))
        
        # 5. EXACT resize_with_padding
        final_image = self.resize_with_padding(cropped, (224, 224))
        
        # 6. EfficientNet preprocessing
        img_array = np.array(final_image, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        return img_array

    def predict_leaf(self, img_path, top_k=5):
        try:
            # Use EXACT dataset pipeline
            img_array = self.preprocess_image_exact_dataset(img_path)
            
            # Get predictions
            predictions = self.model.predict(img_array, verbose=0)[0]
            
            # ✅ ALWAYS TOP 5 predictions
            top_indices = np.argsort(predictions)[-top_k:][::-1]
            top_predictions = []
            
            for rank, idx in enumerate(top_indices, 1):
                prob = float(predictions[idx])
                top_predictions.append({
                    'rank': rank,
                    'class': self.class_names[idx],
                    'confidence': prob,
                    'probability': f"{prob:.1%}",
                    'label': self.class_names[idx], # for frontend compatibility
                    'score': prob                   # for frontend compatibility
                })
            
            return {
                'success': True,
                'predicted_class': top_predictions[0]['class'],
                'confidence': top_predictions[0]['confidence'],
                'predictions': top_predictions, # Frontend expects this array
            }
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return {'success': False, 'error': str(e)}

# Global predictor variable
predictor = None

@app.on_event("startup")
async def startup_event():
    global predictor
    # Point this to your actual .keras file location
    model_path = "efficientnet_b0_final_nb.keras" 
    if os.path.exists(model_path):
        predictor = MedicinalLeafPredictor(model_path)
    else:
        print(f"⚠️ Warning: Model file {model_path} not found in root directory!")

@app.post("/api/identify")
async def identify_plant(file: UploadFile = File(...)):
    if not predictor:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Save uploaded file temporarily so the Image.open logic works exactly as requested
    temp_filename = f"temp_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = predictor.predict_leaf(temp_filename)
        return result
        
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)