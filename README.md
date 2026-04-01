# 🌱 Roots on Route 66

## 📌 Overview

**Roots on Route 66** is a QR-powered community propagation platform that allows users to:

- Scan a QR code to learn how to grow sweet potatoes
- Optionally sign up to receive a free plant clipping
- Track their plant and its origin (mother plant)
- Log progress and contribute to a growing network

---

## 🎯 MVP Goals

The goal of the MVP is to:

- Provide a simple QR → landing experience
- Allow optional user registration
- Assign a plant to registered users
- Track plant data and parent relationships
- Allow users to log progress

---

## 🧱 Tech Stack

### Backend
- Python
- FastAPI
- MongoDB Atlas

### Frontend
- Next.js

### Media Storage
- Cloudinary

### Deployment (later phase)
- Docker
- Google Cloud Run

---
### Main Project Structure
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── README.md
│   ├── app
│   │   ├── config
│   │   │   └── database.py
│   │   ├── main.py
│   │   ├── models
│   │   │   ├── log_model.py
│   │   │   ├── plant_model.py
│   │   │   └── user_model.py
│   │   ├── routes
│   │   │   ├── log_routes.py
│   │   │   ├── plant_routes.py
│   │   │   ├── qr_routes.py
│   │   │   └── user_routes.py
│   │   ├── schemas
│   │   │   ├── log_schema.py
│   │   │   ├── plant_schema.py
│   │   │   └── user_schema.py
│   │   ├── services
│   │   │   ├── log_service.py
│   │   │   ├── plant_service.py
│   │   │   ├── qr_service.py
│   │   │   └── user_service.py
│   │   └── utils
│   │       └── cloudinary.py
│   └── requirements.txt
└── frontend
    ├── README.md
    ├── package.json
    └── src
        ├── app
        │   ├── page.tsx
        │   ├── plant
        │   │   └── [id]
        │   │       └── page.tsx
        │   ├── qr
        │   │   └── [code]
        │   │       └── page.tsx
        │   └── register
        │       └── page.tsx
        ├── components
        │   ├── PlantView.tsx
        │   ├── QRInfo.tsx
        │   └── RegisterForm.tsx
        └── lib
            └── api.ts

19 directories, 31 files
