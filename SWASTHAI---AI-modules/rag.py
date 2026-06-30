import os
import warnings
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from openai import OpenAI  # Perplexity uses OpenAI-compatible API

# Suppress warnings and TensorFlow logs
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Get your Perplexity API key from https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY = "" 

# 1. INITIALISE OUTSIDE THE LOOP (Crucial for speed)
embedding_func = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2", 
    model_kwargs={'device':'cpu'}
)
vector_db = Chroma(
    persist_directory="./chroma_db_nccn", 
    embedding_function=embedding_func
)

# Initialize Perplexity client (OpenAI-compatible)
client = OpenAI(
    api_key=PERPLEXITY_API_KEY,
    base_url="https://api.perplexity.ai"
)


def get_relevant(query):
    context = ""
    # Use the globally loaded vector_db
    search_results = vector_db.similarity_search_with_score(query, k=10)


    for doc, score in search_results:
        context += doc.page_content + "\n"
    print(context)
    return context


def generate_answer(query, context):
    try:
        response = client.chat.completions.create(
            model="sonar-pro", 

            messages=[
    {"role": "system", "content": (
    "Ayurvedic Doctor. Use ONLY the medical text provided. EXTRACT EVERY OUNCE OF INFORMATION FROM THE CONTEXT "
    "If text mentions Vata/Pitta/Kapha headache symptoms, infer traditional remedies. "
    "ALWAYS respond in EXACT format even with partial info:\n"
    "1. Remedy: [Specific herb/oil/treatment], ANSWER IT DETAILED, STRUCTURED AND POINTWISE ADD STEPS IF ANYTHING TO PREPARE\n"
    "2. Dosage: [Traditional dose]\n" 
    "3. Suggestions: [Lifestyle/diet]\n"
    "4. Severity: [Mild/Moderate/Severe]\n"
    "If no treatment info: Use general Ayurvedic principles for mentioned dosha. But mention : 'Used General Medical Information'"
)}
,
    {"role": "user", "content": f"Context: {context}\n\nQuery: {query}"}
],

            temperature=0.3,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error connecting to Perplexity: {str(e)}"

# --- MAIN LOOP ---
while True:
    print("-" * 80 + "\n")
    query = input("Ask? (or type 'exit'): ")
    if query.lower() in ['exit', 'quit']:
        break
        
    context = get_relevant(query)
    if not context.strip():
        print("\nBot: No relevant medical data found in the knowledge base.\n")
        continue
    # prompt = generate_prompt(query=query, context=context)
    answer = generate_answer(query=query, context=context)
    print(f"\n{answer}\n")

