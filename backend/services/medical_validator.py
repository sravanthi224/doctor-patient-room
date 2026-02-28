import re

# Common medical word parts to recognize real clinical terms
MEDICAL_ROOTS = {
    "suffixes": ["itis", "algia", "emia", "pathy", "osis", "oma", "pnea", "uria", "rhea"],
    "prefixes": ["hyper", "hypo", "tachy", "brady", "dys", "endo", "peri", "poly", "neuro"],
    "common_terms": [
        "fever", "pain", "cough", "dizzy", "nausea", "pressure", "ache", 
        "rash", "vomit", "fatigue", "spasm", "clot", "headache"
    ]
}

def verify_symptoms(symptoms_list: list):
    """
    Rule-based validator to cross-reference AI symptoms against clinical patterns.
    Returns: (verified_list, suspicious_list)
    """
    verified = []
    suspicious = []

    if not symptoms_list:
        return verified, suspicious

    for symptom in symptoms_list:
        s_lower = symptom.lower().strip()
        
        # Rule 1: Check against known medical prefixes/suffixes/terms
        has_suffix = any(s_lower.endswith(s) for s in MEDICAL_ROOTS["suffixes"])
        has_prefix = any(s_lower.startswith(p) for p in MEDICAL_ROOTS["prefixes"])
        is_common = any(term in s_lower for term in MEDICAL_ROOTS["common_terms"])
        
        # Rule 2: Basic sanity check (No symbols, reasonable length)
        is_clean = not bool(re.search(r"[^a-zA-Z\s-]", s_lower))
        is_reasonable = 3 <= len(s_lower) <= 40

        if (has_suffix or has_prefix or is_common) and is_clean and is_reasonable:
            verified.append(symptom)
        else:
            # Check individual words in a phrase
            words = s_lower.split()
            if any(any(t in w for t in MEDICAL_ROOTS["common_terms"]) for w in words):
                verified.append(symptom)
            else:
                suspicious.append(symptom)

    return verified, suspicious