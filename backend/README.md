# 🐍 Roots on Route 66 - Backend

## 📌 Overview

This is the backend service for the **Roots on Route 66** project.

It is built using **FastAPI** and connects to **MongoDB Atlas** to handle:

- User registration
- Plant tracking
- QR code lookup
- Progress logging

---

## 🧱 Tech Stack

- FastAPI
- Python 3
- MongoDB Atlas
- Motor (async MongoDB driver)
- Cloudinary (image uploads)

---

## 📁 Structure


app/
├── config/ # Database connection
├── models/ # Data models
├── schemas/ # Request validation
├── routes/ # API endpoints
├── services/ # Business logic
└── utils/ # Helpers


---

## ⚙️ Setup

### 1. Navigate to backend

```bash
cd backend
2. Create virtual environment
python3 -m venv venv
3. Activate environment
source venv/bin/activate
4. Install dependencies
pip install -r requirements.txt
🔐 Environment Variables

Create a .env file:

MONGO_URI=your_mongodb_connection_string
CLOUDINARY_URL=your_cloudinary_url
