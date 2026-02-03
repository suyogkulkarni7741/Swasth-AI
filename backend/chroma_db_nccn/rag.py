import os
import warnings
from pathlib import Path
import chromadb
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from openai import OpenAI 

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# --- 1. SETUP PATHS ---
# This forces the code to look in the exact folder where this script is located
CURRENT_DIR = Path(__file__).resolve().parent
PERSIST_DIRECTORY = str(CURRENT_DIR)

# Global variables
_vector_db = None
_client = None

def _get_actual_collection_name():
    """
    Auto-detects the collection name from the database files.
    """
    try:
        # Use native client to inspect the DB
        client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        collections = client.list_collections()
        
        if not collections:
            print(f"⚠️ Warning: No collections found in {PERSIST_DIRECTORY}")
            return "langchain" # Default fallback
            
        # Get the first collection (most likely the one we want)
        first_collection = collections[0].name
        count = client.get_collection(first_collection).count()
        
        print(f"✅ Found Collection: '{first_collection}' containing {count} items.")
        return first_collection
        
    except Exception as e:
        print(f"⚠️ Error inspecting DB: {e}")
        return "langchain"

def _ensure_initialized():
    """Initialize resources (DB, Model, Client) only when needed."""
    global _vector_db, _client

    if _vector_db is not None and _client is not None:
        return True

    # Check for API Key
    api_key = os.getenv('PERPLEXITY_API_KEY')
    if not api_key:
        print("❌ Error: PERPLEXITY_API_KEY missing from environment.")
        raise RuntimeError("PERPLEXITY_API_KEY missing")

    try:
        print(f"🔄 Initializing RAG from: {PERSIST_DIRECTORY}")
        
        # 1. Define Embeddings (Must match what was used to create the DB)
        embedding_func = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device':'cpu'}
        )

        # 2. Auto-detect Collection Name
        collection_name = _get_actual_collection_name()

        # 3. Load Database with correct collection
        _vector_db = Chroma(
            persist_directory=PERSIST_DIRECTORY,
            embedding_function=embedding_func,
            collection_name=collection_name
        )

        _client = OpenAI(
            api_key=api_key,
            base_url="https://api.perplexity.ai"
        )
        return True
    except Exception as e:
        raise RuntimeError(f"Failed to initialize RAG: {e}") from e

def get_relevant(query, k: int = 3):
    """Retrieve top-k documents from ChromaDB."""
    try:
        _ensure_initialized()
        print(f"🔍 Searching for: '{query}'")
        results = _vector_db.similarity_search(query, k=k)
        
        if not results:
            print(f"⚠️ Search returned 0 results for query: '{query}'")
            print(f"📊 Database path: {PERSIST_DIRECTORY}")
            print(f"📊 Vector DB: {_vector_db}")
            return ""
        
        print(f"✅ Found {len(results)} relevant documents")
        context = "\n".join([doc.page_content for doc in results])
        print(f"📄 Context length: {len(context)} characters")
        return context
    except Exception as e:
        print(f"❌ RAG Retrieval Error: {e}")
        import traceback
        traceback.print_exc()
        return ""

def generate_answer(query, context, temperature: float = 0.3):
    """Generate answer using Perplexity/OpenAI."""
    try:
        _ensure_initialized()
        
        # If no context found, return a polite fallback
        if not context.strip():
            return "I couldn't find specific ayurvedic data for this in my database."

        response = _client.chat.completions.create(
            model="sonar-pro",
            messages=[
                {"role": "system", "content": (
                    "You are a medical assistant. Answer ONLY using the medical context provided. "
                    "If the context is insufficient, state that clearly. "
                    "Format strictly as:\n"
                    "1. **Remedy & Preparation**\n2. **Dosage**\n3. **Suggestions**\n4. **Severity**"
                )},
                {"role": "system", "content": f"Medical Context:\n{context}"},
                {"role": "user", "content": query}
            ],
            temperature=temperature,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating answer: {str(e)}"