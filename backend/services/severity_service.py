def detect_severity(text):
    """
    Deterministically scans for medical red flags.
    """
    text = text.lower()

    CRITICAL_KEYWORDS = [
        "chest pain", "difficulty breathing", "unconscious", 
        "severe bleeding", "stroke", "heart attack", "seizure"
    ]

    MODERATE_KEYWORDS = [
        "fever", "vomiting", "infection", "persistent pain", "headache"
    ]

    if any(word in text for word in CRITICAL_KEYWORDS):
        return "HIGH/CRITICAL"

    if any(word in text for word in MODERATE_KEYWORDS):
        return "MEDIUM"

    return "LOW"