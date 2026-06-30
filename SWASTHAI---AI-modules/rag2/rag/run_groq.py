import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

# 1. Setup Environment
os.environ["GROQ_API_KEY"] = ""
CHROMA_PATH = "./chroma_db_ayurveda"

def get_ayurvedic_answer(user_query: str):
    # This now returns the full response object
    response = rag_chain.invoke({"input": user_query})
    
    print("\n--- SOURCES USED ---")
    for i, doc in enumerate(response["context"]):
        # This shows you the EXACT text pulled from your PDF
        print(f"Source {i+1}:\n{doc.page_content[:200]}...") 
    
    return response["answer"]

def run_ayurvedic_ai():
    # 2. Get the user input immediately
    user_query = input("Describe your health concern: ")
    
    if not user_query.strip():
        print("No input provided. Exiting.")
        return

    print("\n[System] Initializing expert knowledge... (Please wait)")

    # 3. Initialize Models (The "Heavy" part)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)

    # 4. Build the Chain
    system_prompt = (
    "SYSTEM ROLE: You are an expert Ayurvedic practitioner. Your ONLY source of truth "
    "is the provided Context. Use it to provide holistic healing advice.\n\n"
    
    "RESPONSE GUIDELINES:\n"
    "1. FORMAT: Use bold headers for the health conditions (e.g., **Fever**, **Common Cold**).\n"
    "2. STEPS & REMEDIES: If the context describes a process (making tea, a paste, or a compress), "
    "list the steps in a clear, numbered list.\n"
    "3. QUOTATIONS: For every remedy, you MUST include a verbatim quote as a source. "
    "Format it as: > *'Direct quote from text'*\n"
    "4. SYNONYMS: If the user asks for a 'cold' and you find 'Common Cold' or 'Congestion' in the context, "
    "use that information. Do not be overly literal with word matching.\n"
    "5. FALLBACK: Only if there is absolutely no mention of the condition or related symptoms "
    "should you say: 'I cannot provide a remedy for this as it is not found in the dataset.'\n\n"
    
    "CONTEXT:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    # 5. Get and Print Result
    print("[System] Analyzing remedies...")
    response = rag_chain.invoke({"input": user_query})
    
    print("\n" + "="*50)
    print(f" Swasth-AI REMEDY:\n{response['answer']}")
    print("="*50)

if __name__ == "__main__":
    run_ayurvedic_ai()