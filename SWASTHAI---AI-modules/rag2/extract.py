from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Configuration (Using forward slashes to prevent Windows path errors)
PDF_FILE_PATH = "C:/Users/chinm/Desktop/Swasth-AI/RAG/rag2/The Complete Book of Ayurvedic Home Remedies.pdf"
CHROMA_PATH = "./chroma_db_ayurveda"

def build_database():
    print("1. Loading the Ayurvedic book...")
    loader = PyPDFLoader(PDF_FILE_PATH)
    docs = loader.load()

    print("2. Chunking the text...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(docs)
    print(f"Created {len(chunks)} chunks.")

    print("3. Generating local embeddings (No API limits!)...")
    # Using the local HuggingFace model
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Create and save the database
    Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=CHROMA_PATH
    )
    print("Database built and saved successfully!")

if __name__ == "__main__":
    build_database()