import os
import warnings
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from openai import OpenAI  # Perplexity uses OpenAI-compatible API

# Suppress warnings and TensorFlow logs
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Get your Perplexity API key from https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')  # Set this in your .env file (recommended)

# Lazy initialization of heavy resources to avoid import-time failures
_embedding_func = None
_vector_db = None
_client = None


def _ensure_initialized():
    """Instantiate embedding function, Chromadb vector store and Perplexity/OpenAI client on first use.
    Returns True if initialization succeeded, raises RuntimeError with helpful message otherwise.
    """
    global _embedding_func, _vector_db, _client, PERPLEXITY_API_KEY

    if _vector_db is not None and _client is not None:
        return True

    if not PERPLEXITY_API_KEY:
        raise RuntimeError("PERPLEXITY_API_KEY not set. Add it to your environment (.env) or pass it before calling the module.")

    try:
        # Importing inside function reduces import-time overhead and avoids C-extension issues at module import
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import Chroma
        from openai import OpenAI

        _embedding_func = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device':'cpu'}
        )

        _vector_db = Chroma(
            persist_directory="./chroma_db_nccn",
            embedding_function=_embedding_func
        )

        _client = OpenAI(
            api_key=PERPLEXITY_API_KEY,
            base_url="https://api.perplexity.ai"
        )

        return True
    except Exception as e:
        # Re-raise with context to help debugging
        raise RuntimeError(f"Failed to initialize RAG dependencies: {e}") from e

# def generate_prompt(query, context):
#     escaped=context.replace("'","").replace('"',"").replace("*","").replace("\n"," ")
#     prompt = ("""
#     You are a doctor bot which answers to their patient based on their symptoms asked.
#     Be sure to respond correctly and to a patient who doesn't have any knowledge about medicine technically.
#     Strike a friendly tone but answer only specificity nothing like 'here it is', etc. Avoid text if the user is asking irrelevant questions.
#     If the context is irrelevant, you may ignore it or state its irrelevance and answer on your own but if you answer on your own specify it directly.\
#               The answer should be in format, 1. Remedy, 2. Dosage(if there), 3. Suggestions, 4. Severity\
#               Avoid emojis and be professional like a doctor and give on point outputs and avoid reference markings as well
    
#     QUESTION: '{query}'
#     CONTEXT: '{context}'

#     ANSWER: 
#     """).format(query=query, context=context)
#     return prompt

def get_relevant(query, k: int = 10):
    """Return concatenated page content for the top-k similar documents. Returns empty string on init error."""
    try:
        _ensure_initialized()
    except Exception as e:
        print(f"RAG init error: {e}")
        return ""

    results = _vector_db.similarity_search_with_score(query, k=k)
    return "\n".join([doc.page_content for doc, _ in results])


def generate_answer(query, context, temperature: float = 0.3, max_tokens: int = 1000):
    try:
        _ensure_initialized()
    except Exception as e:
        return f"Configuration Error: {e}"

    if not context.strip():
        return ""

    try:
        response = _client.chat.completions.create(
            model="sonar-pro",  # Perplexity's recommended model
            messages=[
                {"role": "system", "content": (
                    "You are a medical assistant. "
                    "Answer ONLY using the medical context provided. "
                    "If the context does not contain the answer, say "
                    "'This answer is based on general medical knowledge, not the database.' "
                    "Use simple language for patients. Add simple language so that even a small kid could understand along with medical context "
                    "Format strictly and only add if the condition requires to break the series as:\n"
                    "1. Remedy and step wise preparation\n2. Dosage\n3. Suggestions\n4. Severity"
                    "Dont add references like this [1][2]"
                )},
                {"role": "system", "content": f"Medical Context:\n{context}"},
                {"role": "user", "content": query}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error connecting to Perplexity: {str(e)}"

if __name__ == "__main__":
    # Interactive console (only runs when executed directly)
    while True:
        print("-" * 80 + "\n")
        try:
            query = input("Ask? (or type 'exit'): ")
        except (EOFError, KeyboardInterrupt):
            break
        if query.lower() in ['exit', 'quit']:
            break

        context = get_relevant(query)
        if not context.strip():
            print("\nBot: No relevant medical data found in the knowledge base.\n")
            continue
        # prompt = generate_prompt(query=query, context=context)
        answer = generate_answer(query=query, context=context)
        print(f"\n{answer}\n")
