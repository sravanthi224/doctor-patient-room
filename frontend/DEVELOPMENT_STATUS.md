# Quick Checklist
```markdown
- [ ] FR-01: Symptom Input
- [ ] FR-02: Dynamic Questioning
- [ ] FR-03: Medical History Collection
- [ ] FR-04: Emergency Detection
- [ ] FR-05: Structured Data Conversion
- [ ] FR-06: Draft Report Generation
- [x] FR-07: No Autonomous Diagnosis
- [x] FR-08: Report Review Interface
- [ ] FR-09: Editing Capabilities
- [x] FR-10: Approval Workflow
- [x] FR-11: Patient Queue Management
- [x] NFR-01: Human-in-the-Loop
- [ ] NFR-02: Hallucination Mitigation
- [ ] NFR-03: Audit Trail
- [ ] NFR-04: Data Privacy
- [ ] NFR-05: Access Control
- [x] NFR-06: Accessibility
- [x] NFR-07: Clinician-Friendly Format
- [x] NFR-08: Availability
- [ ] NFR-09: Response Latency
- [ ] NFR-10: Integration
- [x] C-01: Use existing web technologies
- [x] C-02: Decision-support tool only
```

---
# Functional Requirements Status

- [ ] **FR-01: Symptom Input**: The system shall provide a conversational interface (chatbot) allowing patients to describe their symptoms in natural language. *(Partially Accomplished: UI mock is ready but requires backend API integration)*

- [ ] **FR-02: Dynamic Questioning**: The AI Triage Assistant shall generate relevant follow-up questions based on the patient's initial input to clarify severity, duration, and associated symptoms. *(Partially Accomplished: Currently hardcoded mock responses; requires real LLM)*

- [ ] **FR-03: Medical History Collection**: The system shall collect relevant patient history (e.g., past conditions, allergies) during the conversational flow. *(Not Accomplished: Requires AI prompt instructions and history context)*

- [ ] **FR-04: Emergency Detection**: The system shall identify keywords or patterns indicating immediate life-threatening emergencies and alert the user/system administrator immediately. *(Partially Accomplished: Basic keyword matching works, needs nuanced AI fallback)*

- [ ] **FR-05: Structured Data Conversion**: The system shall process unstructured conversation text into a structured clinical format. *(Partially Accomplished: UI can render the structured output, but data processing pipeline is missing)*

- [ ] **FR-06: Draft Report Generation**: The system shall automatically generate a Preliminary Medical Report upon completion of the patient interview. *(Partially Accomplished: UI mock has report generated, backend trigger is missing)*

- [x] **FR-07: No Autonomous Diagnosis**: The system shall be restricted from finalizing a diagnosis or treatment plan; all AI outputs must be labeled as "Draft" or "Preliminary" until approved. *(Accomplished: Labels clearly defined in the UI)*

- [x] **FR-08: Report Review Interface**: The system shall provide a dashboard for doctors to view incoming preliminary reports. *(Accomplished: Doctor Detail Screen successfully implemented)*

- [ ] **FR-09: Editing Capabilities**: Doctors shall be able to edit, add, or delete information in the AI-generated draft report to correct inaccuracies (hallucinations) or add observations. *(Partially Accomplished: Assessment textbox works, but Chief Complaint/HPI needs to be made editable)*

- [x] **FR-10: Approval Workflow**: The system shall require a mandatory manual confirmation (digital 
signature or "Approve" button) from the doctor to finalize the report. *(Accomplished: 'Approve & Sign' button workflow securely implemented)*

- [x] **FR-11: Patient Queue Management**: The system shall display a list of waiting patients prioritized by the urgency determined during the triage phase. *(Accomplished: Doctor Dashboard accurately prioritizes patients)*

# Non-Functional Requirements (NFRs) Status

## 3.1 Safety & Reliability (Critical)

- [x] **NFR-01: Human-in-the-Loop**: The system must strictly enforce a "Human-in-the-Loop" architecture where no medical report acts as a final record without human verification. *(Accomplished: Architecture physically enforces manual sign-off)*

- [ ] **NFR-02: Hallucination Mitigation**: The AI model must be tuned or prompted to minimize "hallucinations" (inventing facts). It should flag low-confidence interpretations for the doctor. *(Not Accomplished: Pending LLM hook up)*

- [ ] **NFR-03: Audit Trail**: The system must maintain a log of the original patient chat transcript alongside the final doctor-approved report for liability and verification purposes. *(Not Accomplished: Waiting on database integration)*

## 3.2 Security & Privacy

- [ ] **NFR-04: Data Privacy**: The system must adhere to strict data privacy standards (e.g., HIPAA/GDPR compliance guidelines) regarding the storage and transmission of Personal Health Information (PHI). *(Not Accomplished: Backend rules required)*

- [ ] **NFR-05: Access Control**: Strict role-based authentication must be implemented to ensure patients can only see their own data and only authorized medical staff can access patient reports. *(Not Accomplished: True Authentication is missing from Landing portal)*

## 3.3 Usability

- [x] **NFR-06: Accessibility**: The patient chat interface should be accessible to users with varying levels of technical literacy. *(Accomplished: Simple UI built keeping mobile-first standards in mind)*

- [x] **NFR-07: Clinician-Friendly Format**: Generated reports must follow standard medical reporting formats (e.g., SOAP notes) to ensure they are immediately useful to doctors. *(Accomplished: Clean interface structuring Chief Complaint, HPI, and Vitals)*

## 3.4 Technical & Operational Feasibility

- [x] **NFR-08: Availability**: The system should be available 24/7 for patient intake, though doctor review may be limited to working hours. *(Accomplished: Design allows patient independent intake)*

- [ ] **NFR-09: Response Latency**: The chatbot must respond to patient inputs in near real-time (e.g., < 2 seconds) to maintain a natural conversation flow. *(Partially Accomplished: Mocked 1.5s delay implemented, waiting for real API latency checks)*

- [ ] **NFR-10: Integration**: The system should be designed with API capabilities to potentially integrate with existing Hospital Information Systems (HIS) or Electronic Health Records (EHR) in the future. *(Not Accomplished: Future backend API task)*

# Constraints

- [x] **C-01**: The system must be developed using existing web technologies and available open-source AI/NLP tools to maintain economic feasibility. *(Accomplished (React Native))*

- [x] **C-02**: The system operates as a decision-support tool, not a decision-making tool *(Accomplished (Draft badges ensure support role))*
