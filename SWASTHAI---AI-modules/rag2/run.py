import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
# Instead of: from langchain.chains import create_retrieval_chain
# Use the direct community/core paths:
# Change these two lines
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

# The rest of your imports (HuggingFace, Gemini, etc.) stay the same
from langchain_core.prompts import ChatPromptTemplate

# Configuration
# You STILL need your Gemini API key here for the final answer generation
os.environ["GOOGLE_API_KEY"] = "" 
CHROMA_PATH = "./chroma_db_ayurveda"

# Global variables
embeddings = None
vector_store = None
rag_chain = None

def initialize_rag_pipeline():
    global embeddings, vector_store, rag_chain
    
    print("Initializing local embeddings and loading ChromaDB...")
    
    # 1. Load the exact same local model used in Script 1
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # 2. Load the existing local database
    vector_store = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    print("Connecting to Gemini for text generation...")
    # 3. Setup the Gemini LLM
    llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.2)
    
    system_prompt = (
        "You are an expert practitioner in Ayurvedic medicine. Use the following pieces of "
        "retrieved context from an Ayurvedic remedy book to answer the user's question. "
        "If the answer is not contained in the context, kindly state that you don't know based "
        "on the provided book. Keep your answers clear, holistic, and concise.\n\n"
        "Context:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # 4. Create the pipeline
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    print("Pipeline ready.")

def get_ayurvedic_answer(user_query: str) -> str:
    if rag_chain is None:
        raise Exception("Pipeline not initialized. Call initialize_rag_pipeline() first.")
    
    response = rag_chain.invoke({"input": user_query})
    return response["answer"]

# --- Test the app locally ---
if __name__ == "__main__":
    initialize_rag_pipeline()
    
    query = "What are the recommended Ayurvedic remedies for a sore throat?"
    print(f"\nUser: {query}")
    print(f"Bot: {get_ayurvedic_answer(query)}")