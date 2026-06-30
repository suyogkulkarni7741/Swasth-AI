# SWASTHAI — AI Modules (My Contribution)

This repository contains **my individual AI/ML contribution** to the SwasthAI group project.  
It focuses on **plant image classification** and **intelligent Ayurvedic remedy retrieval** using deep learning, embeddings, vector databases, and a RAG pipeline.

> This repo is intentionally maintained separately to clearly showcase my technical ownership.

---

## 📁 Repository Structure

| File | Description |
|-----|-------------|
| `model_v2.ipynb` | EfficientNet training and evaluation notebook |
| `predict_for_deployment.ipynb` | Inference and prediction pipeline |
| `generate_embeddings.py` | Embedding generation for Ayurvedic text |
| `rag.py` | Retrieval-Augmented Generation (RAG) pipeline |

---

## 🌿 1. EfficientNet Model — Plant / Leaf Identification

**File:** `model_v2.ipynb`

This notebook contains the complete workflow for training a deep learning model to identify Ayurvedic plants from leaf images.

### Key Details
- Initial experimentation with MobileNetV2 showed poor generalization (~40% accuracy)
- Migrated to **EfficientNet** for better parameter efficiency and accuracy
- Applied preprocessing techniques such as:
  - Background removal
  - Image resizing and normalization
  - Data augmentation
  - Dataset compression

### Performance
- Accuracy: ~92%
- F1-score: ~0.91
- Some classes underperform due to limited data availability

---

## 🔮 2. Prediction & Inference Pipeline

**File:** `predict_for_deployment.ipynb`

This notebook handles **model inference**, making the trained EfficientNet model usable for real-world predictions.

### Workflow
1. Load trained EfficientNet model
2. Preprocess input leaf image
3. Run inference
4. Output predicted plant class with confidence

This notebook is designed to be **deployment-ready** and modular for future integration.

---

## 🧠 3. Embeddings Generation

**File:** `generate_embeddings.py`

This script converts Ayurvedic textual knowledge into **semantic embeddings**.

### Purpose
- Transform symptoms, remedies, and plant descriptions into vector representations
- Enable semantic similarity search instead of keyword-based matching

### Output
- Each text chunk is stored as:
  - Text
  - Embedding vector
  - Metadata (plant name, remedy type, etc.)

These embeddings act as the foundation for the RAG pipeline.

---

## 🗄️ 4. RAG — Retrieval-Augmented Generation

**File:** `rag.py`

This module implements a **Retrieval-Augmented Generation (RAG)** pipeline to suggest Ayurvedic remedies based on user symptoms.

### How It Works
1. User inputs symptoms
2. Symptoms are converted into embeddings
3. Relevant knowledge is retrieved from a vector database (ChromaDB)
4. Retrieved context is passed to an LLM
5. LLM generates a grounded, context-aware remedy response

### Why RAG?
- Reduces hallucinations
- Grounds responses in curated Ayurvedic data
- Produces explainable and reliable outputs

---

## 🎯 Summary

This repository demonstrates my work in building the **AI intelligence layer** of SwasthAI by combining:

- Deep learning (EfficientNet)
- Image preprocessing and inference pipelines
- Embeddings and vector search
- Retrieval-Augmented Generation (RAG)

The goal is to deliver **accurate plant identification** and **context-aware Ayurvedic recommendations**.

---

📌 *This repository documents only my individual technical contribution to the SwasthAI project.*
