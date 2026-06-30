import os
import shutil
import numpy as np
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageFile
from rembg import remove
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from dotenv import load_dotenv

# --- 1. SETUP ENVIRONMENT ---
# Load .env from project root (Swasth-AI2/.env)
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

# Safety settings
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

# --- 2. IMPORT RAG MODULE ---
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

rag_available = False
rag_chain = None

# --- 3. VISION MODEL (EfficientNet) ---
class MedicinalLeafPredictor:
    def __init__(self, model_path):
        print("🔄 Loading EfficientNet model architecture...")
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
        
        print("🔄 Initializing background removal session...")
        import rembg
        # Using u2netp (lightweight version) for faster background removal
        self.bg_session = rembg.new_session("u2netp")
        
        try:
            import keras
            base = keras.applications.EfficientNetB0(include_top=False, weights=None, input_shape=(224,224,3))
            self.model = keras.Sequential([
                base,
                keras.layers.GlobalAveragePooling2D(),
                keras.layers.BatchNormalization(),
                keras.layers.Dense(256, activation='relu'),
                keras.layers.Dense(len(self.class_names), activation='softmax')
            ])
            print("🔄 Loading weights from .keras file...")
            self.model.load_weights(model_path, skip_mismatch=True)
            print(f"✅ Plant Model loaded successfully!")
        except Exception as e:
            print(f"Failed to load model weights manually: {e}")
            raise e
    
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
        
        # Optimize: Resize high-res phone photos before background removal to massively speed up rembg
        # 600x600 is plenty of resolution for a model that ultimately takes 224x224
        image.thumbnail((600, 600), Image.Resampling.LANCZOS)
        
        removed_bg = remove(image, session=self.bg_session)
        black_bg = Image.new("RGBA", removed_bg.size, (0, 0, 0, 255))
        merged = Image.alpha_composite(black_bg, removed_bg).convert("RGB")
        np_img = np.array(merged)
        mask = np.any(np_img != [0, 0, 0], axis=-1)
        coords = np.column_stack(np.where(mask))
        if coords.size == 0: return self.resize_with_padding(merged, (224, 224))
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

# Global predictor instance
predictor = None

@app.on_event("startup")
async def startup():
    global predictor
    model_file = "efficientnet_b0_final_nb.keras"
    if os.path.exists(model_file):
        try:
            predictor = MedicinalLeafPredictor(model_file)
        except Exception as e:
            print(f"⚠️ Warning: Failed to load plant model: {e}")
            print("Plant identification will be unavailable, but RAG will work.")
            predictor = None
    else:
        print(f"⚠️ Warning: Model file '{model_file}' not found.")
        
    global rag_available, rag_chain
    try:
        print("🔄 Loading RAG Module with Groq...")
        chroma_path = "../SWASTHAI---AI-modules/rag2/chroma_db_ayurveda"
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = Chroma(persist_directory=chroma_path, embedding_function=embeddings)
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})
        
        llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
        
        system_prompt = (
        "SYSTEM ROLE: You are an expert Ayurvedic practitioner. Your ONLY source of truth "
        "is the provided Context. Use it to provide holistic healing advice.\\n\\n"
        
        "RESPONSE GUIDELINES:\\n"
        "1. FORMAT: Use bold headers for the health conditions (e.g., **Fever**, **Common Cold**).\\n"
        "2. STEPS & REMEDIES: If the context describes a process (making tea, a paste, or a compress), "
        "list the steps in a clear, numbered list.\\n"
        "3. QUOTATIONS: For every remedy, you MUST include a verbatim quote as a source. "
        "Format it as: > *'Direct quote from text'*\\n"
        "4. SYNONYMS: If the user asks for a 'cold' and you find 'Common Cold' or 'Congestion' in the context, "
        "use that information. Do not be overly literal with word matching.\\n"
        "5. FALLBACK: Only if there is absolutely no mention of the condition or related symptoms "
        "should you say: 'I cannot provide a remedy for this as it is not found in the dataset.'\\n\\n"
        
        "CONTEXT:\\n{context}"
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        rag_available = True
        print("✅ RAG Module loaded successfully")
    except Exception as e:
        print(f"⚠️ RAG Module failed to load: {e}")
        rag_available = False

# --- API ENDPOINTS ---

@app.post("/api/identify")
async def identify_plant(file: UploadFile = File(...)):
    if not predictor: 
        raise HTTPException(status_code=503, detail="Plant model not loaded")
    
    temp_filename = f"temp_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer: 
            shutil.copyfileobj(file.file, buffer)
        return predictor.predict(temp_filename)
    finally:
        if os.path.exists(temp_filename): 
            os.remove(temp_filename)

class RemedyRequest(BaseModel):
    symptoms: str

@app.post("/api/remedy")
async def get_remedy(request: RemedyRequest):
    if not rag_available:
        return {"response": "System is offline (RAG module not loaded). Check backend logs."}
    
    try:
        response = rag_chain.invoke({"input": request.symptoms})
        return {"response": response["answer"]}
        
    except Exception as e:
        print(f"RAG Error: {e}")
        return {"response": f"Error consulting knowledge base: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)