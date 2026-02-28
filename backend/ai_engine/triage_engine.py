import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# UPDATED: Current 2026 stable model (fixes decommissioned error)
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """
You are an AI medical triage assistant for the 'Doctor Patient Room' system.
Your job is to:
1. Understand patient symptoms.
2. Ask follow-up medical questions (one at a time) to gather context.
3. Prepare the conversation for a structured triage report.

IMPORTANT: Do not provide a formal diagnosis. You are a decision support tool for the doctor.
Be concise, empathetic, and medically relevant. 
"""

def generate_ai_response(messages):
    """
    Receives the full message history as a list of dictionaries.
    Example: [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
    """
    try:
        chat_completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.3
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"AI Service Error: {str(e)}"