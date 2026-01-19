import os
import shutil
import numpy as np
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageFile
from rembg import remove
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from dotenv import load_dotenv

# --- LOAD ENV FROM ROOT DIRECTORY ---
# This looks for the .env file in the folder one level up (the project root)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# --- RAG Imports ---
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from openai import OpenAI

# Safety fixes
ImageFile.LOAD_TRUNCATED_IMAGES = True
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. EfficientNet Plant Predictor ---
class MedicinalLeafPredictor:
    def __init__(self, model_path):
        print("🔄 Loading EfficientNet model...")
        self.model = load_model(model_path, compile=False)
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
        print(f"✅ Plant Model loaded!")
    
    def resize_with_padding(self, img, target_size=(224, 224)):
        original_w, original_h = img.size
        target_w, target_h = target_size
        scale = min(target_w / original_w, target_h / original_h)
        new_w = int(original_w * scale)
        new_h = int(original_h * scale)
        resized = img.resize((new_w, new_h), Image.BILINEAR)
        padded = Image.new("RGB", target_size, (0, 0, 0))
        padded.paste(resized, ((target_w - new_w) // 2, (target_h - new_h) // 2))
        return padded
    
    def preprocess_image(self, img_path):
        image = Image.open(img_path).convert("RGBA")
        image.load()
        removed_bg = remove(image)
        black_bg = Image.new("RGBA", removed_bg.size, (0, 0, 0, 255))
        merged = Image.alpha_composite(black_bg, removed_bg).convert("RGB")
        np_img = np.array(merged)
        mask = np.any(np_img != [0, 0, 0], axis=-1)
        coords = np.column_stack(np.where(mask))
        if coords.size == 0: return self.resize_with_padding(merged, (224, 224)) # Fallback
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        pad = 10
        cropped = merged.crop((max(0, x_min-pad), max(0, y_min-pad), min(merged.width, x_max+pad), min(merged.height, y_max+pad)))
        final_image = self.resize_with_padding(cropped, (224, 224))
        img_array = np.array(final_image, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        return preprocess_input(img_array)

    def predict(self, img_path):
        try:
            img_array = self.preprocess_image(img_path)
            predictions = self.model.predict(img_array, verbose=0)[0]
            top_indices = np.argsort(predictions)[-5:][::-1]
            return {
                'success': True,
                'predictions': [{'label': self.class_names[i], 'score': float(predictions[i])} for i in top_indices]
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

# --- 2. RAG Symptom Checker Setup ---
class RAGSystem:
    def __init__(self):
        print("🔄 Initializing RAG System...")
        
        # Load API Key securely from the loaded environment
        self.pplx_key = os.getenv("PERPLEXITY_API_KEY")
        
        if not self.pplx_key:
            print("❌ Error: PERPLEXITY_API_KEY not found in .env file")
            
        self.embedding_func = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2", 
            model_kwargs={'device':'cpu'}
        )
        self.vector_db = Chroma(
            persist_directory="./chroma_db_nccn", 
            embedding_function=self.embedding_func
        )
        
        self.client = OpenAI(
            api_key=self.pplx_key,
            base_url="https://api.perplexity.ai"
        )
        print("✅ RAG System ready!")

    def get_remedy(self, query: str):
        if not self.pplx_key:
             return "Configuration Error: API Key missing on server. Please check .env file."

        try:
            # 1. Retrieve Context
            docs = self.vector_db.similarity_search(query, k=3)
            context = "\n".join([doc.page_content for doc in docs])
            
            if not context.strip():
                return "I couldn't find specific ayurvedic data for this in my database. However, broadly speaking..."

            # 2. Generate Answer
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert Ayurvedic doctor. Answer ONLY using the medical context provided below. "
                        "If the context is insufficient, state that clearly. "
                        "Use simple language suitable for patients/kids. "
                        "Format your answer strictly as:\n"
                        "1. **Remedy & Preparation**\n2. **Dosage**\n3. **Suggestions**\n4. **Severity**\n\n"
                        f"Medical Context:\n{context}"
                    )
                },
                {"role": "user", "content": query}
            ]
            
            response = self.client.chat.completions.create(
                model="sonar-pro", 
                messages=messages,
                temperature=0.3,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"RAG Error: {e}")
            return f"Sorry, I encountered an error consulting the knowledge base: {str(e)}"

# --- Global Instances ---
predictor = None
rag_system = None

@app.on_event("startup")
async def startup():
    global predictor, rag_system
    # Load Plant Model
    if os.path.exists("efficientnet_b0_final_nb.keras"):
        predictor = MedicinalLeafPredictor("efficientnet_b0_final_nb.keras")
    
    # Load RAG System
    # Ensure 'chroma_db_nccn' folder exists in backend/
    if os.path.exists("./chroma_db_nccn"):
        rag_system = RAGSystem()
    else:
        print("⚠️ Warning: chroma_db_nccn folder not found. RAG features will be disabled.")

# --- API Endpoints ---

@app.post("/api/identify")
async def identify_plant(file: UploadFile = File(...)):
    if not predictor: raise HTTPException(503, "Plant model not loaded")
    temp_filename = f"temp_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
        return predictor.predict(temp_filename)
    finally:
        if os.path.exists(temp_filename): os.remove(temp_filename)

class RemedyRequest(BaseModel):
    symptoms: str

@app.post("/api/remedy")
async def get_remedy(request: RemedyRequest):
    if not rag_system:
        # Fallback if DB missing
        return {"response": "System is offline (Knowledge base not found). Please check backend setup."}
    
    answer = rag_system.get_remedy(request.symptoms)
    return {"response": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)