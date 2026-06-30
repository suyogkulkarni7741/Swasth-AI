# Swasth-AI

Swasth-AI is a comprehensive application for medicinal plant identification and remedy recommendation. It consists of a Next.js frontend and a Python/FastAPI backend.

## Project Structure

The project is organized into two main directories:

- **`frontend/`**: Contains the Next.js application for the user interface.
- **`backend/`**: Contains the Python FastAPI server, machine learning models, and RAG (Retrieval-Augmented Generation) system.

## Getting Started

### Prerequisites

- Node.js (for the frontend)
- Python 3.8+ (for the backend)
- virtualenv (optional but recommended)

### Quick Start

The easiest way to start the development environment is to use the provided script from the root directory:

```bash
./start-dev.sh
```

This script will:
1. Install Python backend dependencies.
2. Start the Python backend server.
3. Install Node.js frontend dependencies.
4. Start the Next.js frontend development server.

### Manual Setup

If you prefer to run the services manually, follow these steps:

#### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create and activate a virtual environment (optional):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Start the server:
```bash
python main.py
```
The backend will run on `http://localhost:8000`.

#### 2. Frontend Setup

Navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:
```bash
npm install
# or
yarn install
```

Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The application relies on environment variables defined in `.env`. Ensure this file is present in both `frontend/` and `backend/` directories (or handled by the startup script).

Key variables include:
- `DATABASE_URL`: Connection string for the database.
- `BETTER_AUTH_SECRET` & `BETTER_AUTH_URL`: Authentication settings.
- `GITHUB_CLIENT_ID` & `SECRET`: GitHub OAuth.
- `GOOGLE_CLIENT_ID` & `SECRET`: Google OAuth..
