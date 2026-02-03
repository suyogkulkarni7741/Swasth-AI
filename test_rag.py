# test_rag_standalone.py
import sys
sys.path.append("./backend")
from dotenv import load_dotenv
load_dotenv()

from chroma_db_nccn import rag

# Test retrieval
context = rag.get_relevant("headache")
print(f"Context: {context[:200]}...")

# Test full answer generation  
answer = rag.generate_answer("I have a headache", context)
print(f"Answer: {answer}")