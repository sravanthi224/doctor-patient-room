# Doctor Patient Room

An AI-assisted clinical triage and diagnosis system built with React Native.

## 📱 Features

### Patient Module
- **AI Chat Interface**: Patients can describe symptoms in natural language
- **Dynamic Questioning**: AI asks relevant follow-up questions
- **Preliminary Report Generation**: Structured medical reports are created automatically

### Doctor Module
- **Dashboard**: View all patient reports with filtering options
- **Priority Queue**: High, medium, and low priority patient sorting
- **Report Review**: Edit and approve AI-generated reports
- **Audit Trail**: Complete history of patient interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Navigate to the project directory:
```bash
cd DoctorPatientRoom
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Press:
- `i` to open iOS Simulator
- `a` to open Android Emulator
- Scan QR code with Expo Go app on physical device

## 📁 Project Structure

```
DoctorPatientRoom/
├── App.js                      # Main entry point
├── index.js                    # Expo registration
├── package.json                # Dependencies
├── app.json                    # Expo configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js     # Stack navigation setup
│   ├── screens/
│   │   ├── RoleSelectionScreen.js    # Role selection (Patient/Doctor)
│   │   ├── PatientChatScreen.js      # AI chat interface
│   │   ├── DoctorDashboardScreen.js  # Doctor dashboard
│   │   └── ReportReviewScreen.js     # Report review & approval
│   ├── components/             # Reusable components
│   └── constants/
│       └── colors.js           # App color palette
└── assets/                     # Images and icons
```

## 🎨 Screens

### 1. Role Selection Screen
- Choose between Patient or Doctor role
- Clean, intuitive interface

### 2. Patient Chat Screen
- Real-time chat with AI Triage Assistant
- Message bubbles with timestamps
- Generate preliminary report button
- Emergency warning banner

### 3. Doctor Dashboard Screen
- Statistics overview (Total, Pending, High Priority)
- Filter tabs (All, Pending, Approved, High Priority)
- Patient report cards with:
  - Patient info (name, age, gender)
  - Urgency level badge
  - Chief complaint
  - Reported symptoms
  - Status (Pending/Approved)

### 4. Report Review Screen
- Patient information header
- AI-generated preliminary report
- Editable fields for corrections
- Doctor notes section
- Audit trail history
- Approve/Edit actions

## 🔒 Safety Features

- **Human-in-the-Loop**: All reports require doctor approval
- **No Autonomous Diagnosis**: AI only generates drafts
- **Emergency Warning**: Clear disclaimer for emergency situations
- **Audit Trail**: Complete history for liability

## 🛠 Technologies Used

- React Native
- Expo
- React Navigation
- JavaScript/JSX

## 📋 Requirements Compliance

This implementation addresses the key requirements from the specification:

| Requirement | Status |
|-------------|--------|
| FR-01: Symptom Input | ✅ Patient chat interface |
| FR-02: Dynamic Questioning | ✅ AI follow-up questions |
| FR-03: Medical History Collection | ✅ Chat flow |
| FR-04: Emergency Detection | ⚠️ Warning banner (placeholder) |
| FR-05: Structured Data Conversion | ✅ Report generation |
| FR-06: Draft Report Generation | ✅ Preliminary reports |
| FR-07: No Autonomous Diagnosis | ✅ Doctor approval required |
| FR-08: Report Review Interface | ✅ Doctor dashboard |
| FR-09: Editing Capabilities | ✅ Edit mode in review |
| FR-10: Approval Workflow | ✅ Approve button with confirmation |
| FR-11: Patient Queue Management | ✅ Priority filtering |

## 📝 Notes

- The global Expo CLI is deprecated. Use npx expo for all Expo commands.
- This is a basic UI implementation for demonstration
- Backend integration (AI model, database, authentication) would be needed for production
- Mock data is used for demonstration purposes
- HIPAA compliance features would need to be implemented in production

