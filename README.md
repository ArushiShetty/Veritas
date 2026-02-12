# VERITAS — Digital Safety & Authenticity Platform

VERITAS is a full-stack digital security platform designed to detect manipulated media, analyze suspicious online identities, and help users verify digital authenticity. It combines machine learning, rule-based detection, and secure storage systems to provide real-time safety insights through a clean and accessible interface.

---

## Overview

As digital threats such as deepfakes, impersonation accounts, and misinformation increase, verifying authenticity has become critical. VERITAS addresses this challenge by integrating automated detection tools, profile analysis modules, encrypted evidence storage, and reporting systems into a single platform.

The system is modular, scalable, and privacy-focused, making it suitable for individuals, researchers, and organizations.

---

## Features

### Deepfake Detection
- Upload images for analysis
- Machine learning-based prediction
- Confidence score output
- Manipulation warning indicators

---

### ProfileGuard Scanner
Analyzes online profiles for suspicious behavior signals:

- Username anomalies  
- Follower/following imbalance  
- Suspicious keywords in bio  
- Activity pattern irregularities  

---

### Secure Evidence Vault
- Encrypted file storage  
- SHA-256 timestamp hashing  
- Tamper-proof verification  

---

### Anonymous Reporting System
- Submit reports without identity disclosure  
- Attach supporting evidence  
- Structured incident logging  

---

### Safety Analyzer
- Detects threatening or harmful text
- Flags risk patterns
- Suggests safety precautions

---

### Safety Assistance Module
- Emergency guidance
- Quick helpline access
- Safety awareness resources

---

## Tech Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Component-based architecture

**Backend**
- Python
- Flask API
- OCR + image processing modules

**Security & Processing**
- SHA-256 hashing
- Secure file handling
- Rule-based + ML detection logic

---

## Installation

### Clone repository
```bash
git clone <YOUR_REPO_URL>
cd veritas
```

---

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
veritas/
│
├── backend/
│   ├── app.py
│   ├── models/
│   ├── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── assets/
│
└── README.md
```

---

## Design Principles

VERITAS was developed with three priorities:

- **Accuracy** — reliable detection systems  
- **Privacy** — secure handling of user data  
- **Accessibility** — simple interface usable by anyone  

---

## Use Cases

- Verifying suspicious media
- Detecting impersonation profiles
- Securing digital evidence
- Supporting online safety awareness
- Monitoring digital threats

---

## Future Enhancements

Planned improvements:

- Real-time video deepfake detection
- Browser extension integration
- AI-driven threat prediction
- Multi-language support
- Mobile application support

---

## License
MIT License

---

## Contributors
Developed and maintained by the VERITAS Team.
