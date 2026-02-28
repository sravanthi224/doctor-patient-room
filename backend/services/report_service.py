import os
import re
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

# UPDATED SYSTEM PROMPT FOR STRUCTURED DATA & FORCED NEWLINES
SYSTEM_PROMPT = """
You are an AI Clinical Triage Assistant. Analyze the conversation and return a valid JSON object.

JSON Schema:
{
  "clinical_report": "The full triage report text",
  "symptoms_list": ["list", "of", "detected", "symptoms"],
  "uncertainty_flag": boolean,
  "uncertainty_reason": "string or null",
  "risk_level": "Low/Medium/High/Critical"
}

CRITICAL INSTRUCTIONS:
- Set 'uncertainty_flag' to true if the patient contradicts themselves or provides vague symptoms.
- FORMATTING: Ensure 'clinical_report' uses clear headings. Each heading MUST be on a new line.
- Use the exact format below, ensuring a newline (\\n) before each heading:
  Patient Info: [Summary]
  Symptoms: [List]
  Duration: [Timeframe]
  Next Steps: [Actionable Advice]
- Do not provide a diagnosis.
"""

def clean_json_string(raw_string: str):
    """Extracts JSON content from markdown code blocks to prevent parsing errors."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_string)
    if match:
        return match.group(1).strip()
    return raw_string.strip()

def format_messages_for_ai(messages):
    formatted = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in messages:
        sender = m.sender if hasattr(m, 'sender') else m.get('sender')
        content = m.content if hasattr(m, 'content') else m.get('content')
        role = "assistant" if sender == "ai" else "user"
        formatted.append({"role": role, "content": content})
    return formatted

def generate_triage_report(messages: list):
    """Analyzes conversation and returns a structured JSON object."""
    try:
        formatted_messages = format_messages_for_ai(messages)
        completion = client.chat.completions.create(
            model=MODEL,
            messages=formatted_messages,
            temperature=0.1, 
            response_format={"type": "json_object"} 
        )
        raw_content = completion.choices[0].message.content
        json_ready_string = clean_json_string(raw_content)
        return json.loads(json_ready_string)
    except Exception as e:
        print(f"AI generation error: {str(e)}")
        return {
            "clinical_report": "Error generating report.",
            "symptoms_list": [],
            "uncertainty_flag": True,
            "uncertainty_reason": f"System Error: {str(e)}",
            "risk_level": "Medium"
        }

def generate_report(chat_history: str):
    """Manual override/legacy support for raw text strings."""
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Conversation:\n{chat_history}"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        raw_content = completion.choices[0].message.content
        json_ready_string = clean_json_string(raw_content)
        return json.loads(json_ready_string)
    except Exception as e:
        return {"error": str(e), "uncertainty_flag": True}