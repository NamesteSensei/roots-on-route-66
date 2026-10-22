# SweetRoots / Roots on Route 66 🌱

**Community plant-lineage tracking | Full-stack integration | Cloud deployment**

SweetRoots is a responsive web application developed as an Atlas School capstone for a Tulsa-area community client. It helps growers register sweet potato plants, record clippings, explore parent/child lineage, and share plants. The project demonstrates coordinated frontend/backend integration, authentication, cloud deployment, and data modeling.

**Live application:** https://roots-on-route-66.vercel.app/  
**API documentation (local):** http://127.0.0.1:8000/docs

> **Project context:** This is a collaborative capstone, not a solo implementation. Project contributions include frontend/backend integration, cloud deployment and troubleshooting, application coordination, and documentation. Individual modules were developed collaboratively.

## What the application does

- Manage grower profiles, plants, propagation status, and plant metadata.
- Track clippings through parent/child relationships and calculated generations.
- Browse searchable plant records and lineage history.
- Sign in using Firebase Authentication; protected API endpoints verify Firebase ID tokens.
- Share plant links and QR-based experiences; upload community images through Cloudinary.
- Use a responsive, installable progressive-web-app interface with a service worker.

## Technology

| Layer | Implementation |
| --- | --- |
| User interface | HTML, CSS, vanilla JavaScript, responsive/PWA assets |
| Authentication | Firebase Authentication (client SDK and server-side Admin verification) |
| API | Python, FastAPI, Pydantic |
| Application data | MongoDB / MongoDB Atlas with Motor async client |
| Uploaded images | Cloudinary |
| Deployment | Vercel (frontend), Google Cloud Run (FastAPI backend) |
| Development | Git/GitHub, Docker, Python virtual environments |

## Architecture

The diagram reflects the **implemented** services and code paths. Vercel and Cloud Run are the hosted components; MongoDB Atlas, Firebase Authentication, and Cloudinary are external services.

~~~mermaid
flowchart LR
    U["Grower / browser"] --> FE["Responsive frontend + PWA<br/>Vercel / static JavaScript"]
    FE -->|"Sign-in and identity"| FA["Firebase Authentication"]
    FE -->|"REST / JSON; ID token for protected routes"| API["FastAPI backend<br/>Google Cloud Run"]
    API -->|"Verify ID token"| FA
    API -->|"Users, plants, lineage, media"| DB[("MongoDB / Atlas")]
    API -->|"Authenticated image upload"| CL["Cloudinary"]
    FE -->|"Image URLs"| CL
~~~

**Request path:** The browser signs in with Firebase, obtains an ID token, calls the FastAPI endpoints, and the backend verifies tokens on protected write/account routes. FastAPI routes invoke service modules, which use MongoDB collections; image uploads are forwarded to Cloudinary.

**Code organization**

- **frontend/** — UI, authentication client initialization, PWA files, and browser-side API configuration.
- **backend/app/routes/** — FastAPI endpoints for users, plants, media, and uploads.
- **backend/app/services/** — user, plant, and media domain logic.
- **backend/app/config/** and **backend/app/core/** — MongoDB, Firebase Admin, Cloudinary, and environment-based configuration.
- **scripts/** — Docker health-check and Google Cloud Run deployment helpers.

## Run locally

### Prerequisites

- Python 3.12 (matches the backend Docker image).
- MongoDB running locally **or** a MongoDB Atlas connection URI.
- A Firebase project for sign-in; Firebase Admin service-account credentials for protected API calls.
- A Cloudinary account for image uploads.
- A browser and a terminal. Node.js is not required to serve the existing static frontend.

### 1. Clone the repository

~~~bash
git clone https://github.com/NamesteSensei/roots-on-route-66.git
cd roots-on-route-66
~~~

### 2. Configure and run the API

~~~bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
~~~

On Windows PowerShell, create the environment with **py -3 -m venv .venv**, activate it with **.venv\Scripts\Activate.ps1**, and copy the example with **Copy-Item .env.example .env**.

Edit **backend/.env** before starting:

- **MONGODB_URI** — replace the example credentials with your own Atlas URI, or set **mongodb://localhost:27017** for a running local MongoDB.
- **MONGODB_DB_NAME** — database name; the example uses **roots_on_route_66**.
- **ALLOWED_ORIGINS** — include **http://localhost:5500** and **http://127.0.0.1:5500** for the local static server.
- **FIREBASE_SERVICE_ACCOUNT_JSON** — full, valid Firebase Admin service-account JSON on one environment-variable line. The example contains a placeholder, **not** a working credential.
- **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_API_SECRET** — needed for image uploads.

**Never commit backend/.env, real Firebase service-account JSON, MongoDB credentials, or Cloudinary secrets.** The browser-side Firebase configuration is a public client configuration, not a substitute for restrictive Firebase security rules.

~~~bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
~~~

Check **http://127.0.0.1:8000/health** and **http://127.0.0.1:8000/docs**. The API creates MongoDB indexes at startup, so MongoDB must be reachable.

### 3. Serve the frontend

From a **second terminal**, in the repository root:

~~~bash
python3 -m http.server 5500 --directory frontend
~~~

Open **http://localhost:5500**. The existing **frontend/config.js** points localhost/127.0.0.1 browsers at **http://127.0.0.1:8000**.

For sign-in on your own Firebase project, update **frontend/firebase-config.js** with that project's public web-app configuration and configure your local host as an authorized domain in Firebase. Do not place a Firebase Admin private key in frontend code.

### 4. Sanity checks

~~~bash
# In the repository root, with Node.js installed:
cd frontend
npm ci
npm run check
~~~

The frontend command above performs a JavaScript syntax check; it is **not** a complete automated test suite. For backend behavior, inspect OpenAPI at **/docs**, confirm database connectivity, and test authenticated create/edit flows with your own Firebase project.

## Selected API operations

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /health | API health response |
| POST | /users/sync | Sync an authenticated Firebase user to MongoDB |
| GET | /users/me | Get current authenticated profile |
| GET | /plants/ | List plant records |
| POST | /plants/ | Create a plant (requires authentication) |
| POST | /plants/clippings | Create a child plant from a parent |
| GET | /plants/{plant_id}/lineage | Retrieve parent lineage |
| GET | /media/ | List community media records |
| POST | /uploads/image | Upload an authenticated image to Cloudinary |

See **backend/app/routes/** for the complete current route set.

## Deployment notes

- The frontend is hosted as static assets on **Vercel**; the API is configured for **Google Cloud Run**.
- **scripts/deploy_backend_cloud_run.sh** deploys the FastAPI service when **PROJECT_ID** is set. It does **not** provision MongoDB, Firebase, Cloudinary credentials, or other required production environment variables.
- Set backend environment variables in the cloud service using a secure secrets/configuration mechanism, and set **ALLOWED_ORIGINS** to the deployed frontend origin.
- **frontend/config.js** currently contains the deployed Cloud Run API URL. Adjust it when deploying to a different project.
- The Cloud Run deploy script permits public HTTP access; authorization is enforced on protected routes by the application. Review access controls, secrets handling, and CORS before operating your own deployment.

## Current scope and limitations

This repository includes implemented Firebase-backed authentication, plant lineage, media endpoints, QR-sharing assets, and PWA support. Some placeholder files in **frontend/src/** and **backend/app/routes/** are **not active application features**. The project does not currently document a comprehensive automated test suite or a complete CI pipeline. Do not infer production guarantees from the health endpoint alone.

## Engineering discussion

The project provides concrete examples of **integration across browser, API, authentication, database, and third-party media services**. Typical debugging paths span Firebase token verification, browser origin configuration, REST request/response contracts, MongoDB connectivity, and frontend/backend deployment configuration.

## License and client ownership

This is a community-client capstone. No separate open-source license is included in the repository; public visibility alone does not grant reuse rights.