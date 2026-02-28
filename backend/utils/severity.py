def detect_severity(message: str):
    msg = message.lower()

    critical_keywords = [
        "chest pain", "cannot breathe", "difficulty breathing", 
        "unconscious", "severe bleeding", "heart attack", "stroke"
    ]

    high_keywords = [
        "high fever", "severe headache", "vomiting blood", "fainted"
    ]

    for word in critical_keywords:
        if word in msg:
            return "Critical"

    for word in high_keywords:
        if word in msg:
            return "High"

    if "pain" in msg or "fever" in msg:
        return "Medium"

    return "Low"