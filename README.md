# 4D & Toto Application

A comprehensive lottery management application for tracking and managing 4D and Toto lottery tickets. This application helps users upload their tickets, automatically check results, receive notifications about winnings, and view predictions.

## Features

- **Ticket Management**: Upload and store your 4D and Toto lottery tickets
- **OCR Integration**: Automatically extract ticket information using optical character recognition
- **Result Scraping**: Automatically fetch latest 4D and Toto draw results
- **Win Checking**: Automatically compare your tickets against draw results
- **Notifications**: Get notified when your tickets win
- **Predictions**: View AI-powered predictions for upcoming draws
- **User Authentication**: Secure login and registration system
- **Dashboard**: Comprehensive overview of your tickets and notifications

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OCR Engine**: Ticket scanning and data extraction
- **Web Scrapers**: Automated result fetching for 4D and Toto draws
- **Supabase**: Database for storing tickets and results
- **Docker**: Containerized deployment

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Axios**: HTTP client
- **React Router**: Navigation
- **Supabase**: Authentication and database client

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv myvenv
# On Windows:
myvenv\Scripts\activate
# On macOS/Linux:
source myvenv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your configuration:
```env
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Docker Setup (Alternative)

If you prefer using Docker, you can run both services using Docker Compose:

```bash
docker-compose up
```

## Project Structure

```
4D-Toto-Application/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # Data models
│   │   ├── ocr/          # OCR engine
│   │   ├── scrapers/     # Result scrapers
│   │   └── services/     # Business logic
│   └── requirements.txt
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   └── services/     # API clients
│   └── package.json
└── README.md
```

## License

This project is licensed under the MIT License.