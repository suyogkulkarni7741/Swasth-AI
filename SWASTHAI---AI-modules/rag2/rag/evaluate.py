import os
from datasets import Dataset
from ragas import evaluate
# Updated imports for Ragas v0.4+
from ragas.metrics import Faithfulness, AnswerRelevancy, ContextPrecision, ContextRecall
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Setup your keys and Judge Model
os.environ["GROQ_API_KEY"] = ""
judge_llm = ChatGroq(
    model_name="llama-3.1-8b-instant", 
    temperature=0.0,
    max_tokens=8192  # <-- This gives the Judge enough room to finish its grading
)
judge_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Create a Test Dataset
# Notice the updated keys: user_input, response, retrieved_contexts, reference
data = {
    "user_input": [
        "Describe your health concern: cold and fever"
    ],
    "response": [
        """Colds and fever are related to each other in Ayurveda. Cold is a kapha-vata disorder, while fever is a sign of an imbalance in the body's energies. Here are some remedies to help alleviate both conditions:

**For Cold (Kapha-Vata Disorder):**
1. **Warm and Spicy Tea**: Make a tea with coriander (2 parts), cinnamon (2 parts), and ginger (1 part). Steep 1 teaspoon of this mixture in a cup of hot water for 10 minutes before drinking. You can drink this every few hours until the congestion and runny nose subside.
2. **Cumin, Coriander, and Fennel Tea**: Mix cumin seeds, coriander seeds, and fennel seeds in equal proportions. Use 1 teaspoon of this mixture in a cup of hot water and drink every few hours to help alleviate congestion and runny nose.
3. **Nasal Irrigation**: Use a neti pot or a squeeze bottle with a nasal spray tip to rinse your nasal passages with warm salt water. This can help clear out mucus and reduce congestion.

**For Fever:**
1. **Cool Water Compress**: Prepare a bowl of cool water with 1 teaspoon of salt. Fold two pieces of clean cloth, dip them into the water, and put one on the forehead and one over the belly button. Repeat as needed to bring down the temperature quickly.
2. **Maha Sudarshan Churna**: If available, take ½ teaspoon of Maha Sudarshan Churna twice a day with warm water to bring down any kind of fever.
3. **Onion Compress (for Pitta Constitution)**: Grate an onion and wrap half in one of the damp handkerchiefs, the other half in the second handkerchief. Place on the forehead and belly button to help relieve fever and prevent febrile convulsions.

Remember to consult with a medical professional if the fever is severe, lasts longer than 3 days, or is accompanied by a severe headache and stiff neck."""
    ],
    "retrieved_contexts": [
        [
            "Another excellent herbal remedy for reducing fever is a tea made of coriander 2 parts, cinnamon 2 parts, ginger 1 part. Steep 1 teaspoon of this mixture in a cup of hot water for 10 minutes before drinking. You can drink this every few hours until the fever breaks.",
            "Another simple three-ingredient tea made of household herbs is this one: cumin seeds, coriander seeds, fennel seeds. Mix seeds in equal proportions. Use 1 teaspoon of your mixture in a cup of boiling water; steep for 10 minutes.",
            "If the temperature is high, prepare a bowl of cool water into which you have added 1 teaspoon of salt. Fold two pieces of clean cloth (such as handkerchiefs), dip them into the water, and put one on the forehead and one over the belly button. Repeat as needed. This will bring down the temperature quickly.",
            "If you can get maha sudarshan churna from an Ayurvedic pharmacy, take ½ teaspoon twice a day with warm water. This formula will bring down any kind of fever.",
            "If the person with high fever has a pitta constitution, there may be a danger of febrile convulsions. To help relieve this condition, make a slight modification of the procedure described above. Grate an onion and wrap half in one of the damp handkerchiefs, the other half in the second handkerchief. Place on the forehead and belly button, as above."
        ]
    ],
    "reference": [
        """To reduce a fever, you can drink a tea made of 2 parts coriander, 2 parts cinnamon, and 1 part ginger, or a tea made of equal proportions of cumin, coriander, and fennel seeds. For a high temperature, apply a cool water compress with 1 teaspoon of salt to the forehead and belly button. If the person has a pitta constitution, an onion compress can be used to prevent febrile convulsions. Maha sudarshan churna (1/2 teaspoon twice a day) can also bring down the fever. Seek medical attention if the fever is severe, lasts longer than 3 days, or is accompanied by a severe headache and stiff neck."""
    ]
}

# Convert to a HuggingFace Dataset
dataset = Dataset.from_dict(data)

# 3. Run the Evaluation
print("Evaluating pipeline metrics... This will take a moment.")
result = evaluate(
    dataset = dataset, 
    metrics=[
        Faithfulness(),
        AnswerRelevancy(),
        ContextPrecision(),
        ContextRecall(),
    ],
    llm=judge_llm,
    embeddings=judge_embeddings
)

# 4. View your Scorecard!
print("\n=== SWASTH-AI METRICS REPORT ===")
df = result.to_pandas()
print(df[['user_input', 'faithfulness', 'answer_relevancy', 'context_precision', 'context_recall']])