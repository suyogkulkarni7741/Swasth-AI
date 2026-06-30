# Swasth-AI RAG Application

This repository contains a Retrieval-Augmented Generation (RAG) pipeline for an Ayurvedic remedy application. It ingests an Ayurvedic book, stores its embeddings, and uses a Large Language Model (LLM) to answer user queries with direct quotations from the text.

## 🚀 Quick Start

### 1. Install Dependencies
Double-click `install.bat` to easily download and install all required Python packages from `requirements.txt`.
Alternatively, you can run:
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
You need to set up the following API keys in your environment, or directly in the scripts:
- `GROQ_API_KEY`: Required for `rag/run_groq.py` and `rag/evaluate.py`.
- `GOOGLE_API_KEY`: Required for `run.py`.

### 3. Build the Database
First, you need to extract text from the PDF and build the ChromaDB vector database:
```bash
python extract.py
```
This script reads `The Complete Book of Ayurvedic Home Remedies.pdf`, chunks the text, generates embeddings locally using HuggingFace (`all-MiniLM-L6-v2`), and saves them into the `chroma_db_ayurveda` directory.

### 4. Run the Application
You have two options for running the app:

**Option A: Using Groq (Llama-3.1-8b-instant)** - *Recommended*
```bash
python rag/run_groq.py
```
This is the most advanced script. It provides accurate answers with exact quotations from the text, formatted nicely with numbered steps and direct references.

**Option B: Using Google Gemini**
```bash
python run.py
```
This script uses the `gemini-pro` model to provide holistic answers based on the context.

### 5. Evaluate the Pipeline
To evaluate the RAG pipeline using Ragas metrics (Faithfulness, Answer Relevancy, Context Precision, and Context Recall), run:
```bash
python rag/evaluate.py
```
This script acts as a "Judge" to automatically grade the responses of the LLM based on predefined ground truth and context.

## 📁 File Structure

- `extract.py`: Ingests the PDF, splits the text, generates embeddings, and saves them to ChromaDB.
- `run.py`: The basic chatbot script using Google Gemini.
- `rag/run_groq.py`: An improved chatbot script using Groq and Llama-3.1, focused on extracting verbatim quotes.
- `rag/evaluate.py`: Evaluation script using the `ragas` library to score the pipeline's performance.
- `requirements.txt`: Python package dependencies.
- `install.bat`: Easy installer for Windows users.
- `chroma_db_ayurveda/`: The generated vector database containing embeddings.
