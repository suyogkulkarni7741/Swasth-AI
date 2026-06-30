import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

# 1. List all your PDF files
pdf_files = [
    './Nadkarni K.M. - Indian Materia medica. Vol.2 - libgen.li (1).pdf',
    './Astanga Hrdayam [English].pdf',
    './881414150-Madhava-Nidana.pdf',
    './The Complete Book of Ayurvedic Home Remedies.pdf'
]

docs = []
for file_path in pdf_files:
    print(f"Loading: {file_path}")
    loader = PyPDFLoader(file_path)
    docs.extend(loader.load())

# 2. Split Text
text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
split_docs = text_splitter.split_documents(docs)

# 3. Setup Embeddings
# NOTE: If this is your first time running, set local_files_only: False 
# to allow the model to download first.
embedding_func = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2", 
    model_kwargs={
        'device': 'cpu',
        'local_files_only': False 
    }
)

# 4. Create and Persist Vector Store
# This will save all three books into the same 'chroma_db_nccn' folder
vectorstore = Chroma.from_documents(
    documents=split_docs, 
    embedding=embedding_func, 
    persist_directory="./chroma_db_nccn"
)

print(f"Successfully embedded {vectorstore._collection.count()} chunks from {len(pdf_files)} books.")
