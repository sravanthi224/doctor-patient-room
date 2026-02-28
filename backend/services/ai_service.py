import json
from ai_engine.triage_engine import generate_ai_response
from datetime import datetime

def chat_with_ai(user_message, chat_history=None, patient_reports=None):
    """
    Assembles the system prompt, historical clinical reports, 
    chat history, and the current message.
    """
    # UPDATED SYSTEM PROMPT WITH EXIT SIGNAL
    system_content = (
        "You are a medical triage AI for the 'Doctor Patient Room' system. "
        "Your goal is to gather symptoms. Ask follow-up questions one at a time. "
        "Do not provide a diagnosis. "
        "CRITICAL INSTRUCTION: When you have gathered enough information "
        "(Chief complaint, duration, severity, and key associated symptoms), "
        "conclude your final response by exactly including the string: '[TRIAGE_COMPLETE]'. "
        "If the patient has a relevant medical history, mention it to show you are aware."
    )
    
    if patient_reports:
        history_summary = "\n\n[PATIENT MEDICAL RECORD FOUND]:\n"
        for rep in patient_reports[:2]:
            report_date = rep.created_at.date() if hasattr(rep.created_at, 'date') else rep.created_at
            history_summary += f"- Date: {report_date}, Summary: {rep.summary}, Severity: {rep.severity}\n"
        
        history_summary += "\nInstruction: If current symptoms relate to history, acknowledge it."
        system_content += history_summary

    messages = [{"role": "system", "content": system_content}]

    if chat_history:
        for msg in chat_history:
            role = "user" if msg.sender == "patient" else "assistant"
            messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})
    return generate_ai_response(messages)

# ... analyze_uncertainty remains the same ...

def analyze_uncertainty(chat_text):
    """
    Analyzes the chat to see if the AI is unsure about the symptoms.
    Returns a tuple: (is_uncertain, reasoning_text)
    """
    prompt = f"""
    Review this medical triage conversation. Are the symptoms described by the patient vague, 
    contradictory, or insufficient for a clear triage? 
    Return a JSON object: {{"is_uncertain": boolean, "reason": "string or null"}}
    
    Chat: {chat_text}
    """
    try:
        response = generate_ai_response([{"role": "user", "content": prompt}])
        data = json.loads(response)
        return data.get("is_uncertain", False), data.get("reason")
    except:
        return False, None

def analyze_feedback_for_improvement(original, final, feedback, role):
    """
    Compares the AI's original draft with the doctor's final approved version 
    plus any feedback to suggest prompt improvements.
    """
    prompt = f"""
    Compare the following clinical data:
    ORIGINAL AI DRAFT: {original}
    FINAL DOCTOR VERSION: {final}
    {role.upper()} FEEDBACK: {feedback}

    Identify if the AI missed any symptoms or misinterpreted the patient. 
    Provide a brief note on how the AI should improve its next triage.
    """
    try:
        # Re-using your existing generate_ai_response function
        improvement_notes = generate_ai_response([{"role": "user", "content": prompt}])
        return improvement_notes
    except Exception as e:
        print(f"Improvement analysis failed: {e}")
        return "Manual review required for AI optimization."