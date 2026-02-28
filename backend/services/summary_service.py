import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

# OPTIMIZED PROMPT FOR CLINICAL REVIEW
SYSTEM_PROMPT = """
You are a professional Medical Assistant. 

Your task is to summarize the patient conversation into a concise clinical summary for a reviewing doctor.
Focus on:
1. Primary symptoms and their duration.
2. Any vital signs or specific values mentioned.
3. Relevant patient history provided during the chat.
4. Any immediate concerns or red flags identified.

Use professional medical terminology and keep it brief (max 150 words).
"""

def summarize_conversation(messages):
    """
    Accepts either:
    1) list of Message objects from SQLAlchemy
    2) raw string conversation
    """
    try:
        # CASE 1: messages list from DB
        if isinstance(messages, list):
            history_text = "\n".join(
                [f"{m.sender}: {m.content}" for m in messages]
            )

        # CASE 2: already a string
        else:
            history_text = messages

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": history_text}
            ],
            temperature=0.2
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"Summary generation failed: {str(e)}"