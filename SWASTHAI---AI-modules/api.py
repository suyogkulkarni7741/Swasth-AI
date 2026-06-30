GEMINI_API_KEY=""

import os
import signal
import sys
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from google import genai
import warnings
warnings.filterwarnings("ignore")
client = genai.Client(api_key=GEMINI_API_KEY)

def generate_prompt(query, context):
    escaped=context.replace("'","").replace('"',"").replace("*","").replace("\n"," ")
    prompt=("""
    You are a doctor bot which answers to their patient based on their symptoms asked\
    Be sure to respond correctly and to a patient who dont have any knowledge about the medicine technically\
    strike a friendly tone\
    also avoid the text if the user is asking irrelevant questions rather than any medical condition\
    if the context is irrelevant to the answer, you may ignore it, or just tell it is irrelevant and give answer on your own after telling the irrelevance\
            QUESTION: '{query}'
            CONTEXT: '{context}'

            ANSWER: 

    """).format(query=query,context=context)

    return prompt

def get_relevant(query):
    context=""
    embedding_func=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={'device':'cpu'})
    vector_db=Chroma(persist_directory="./chroma_db_nccn", embedding_function=embedding_func)
    search_results=vector_db.similarity_search(query, k=6)
    for results in search_results:
        context+=results.page_content+"\n"
    return context

def generate_answer(prompt):
    genai.configure(api_key=GEMINI_API_KEY)
    model=genai.GenerativeModel(model_name='gemini-1.5-flash-latest')
    answer=model.generate_content(prompt)
    return answer.text

while True:
    print("-------------------------------------------------------------------------------- \n")
    print("Ask?")
    query=input("Query: ")
    context=get_relevant(query)
    prompt=generate_prompt(query=query,context=context)
    answer=generate_answer(prompt=prompt)

    print(answer)
