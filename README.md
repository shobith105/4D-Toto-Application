# TicketSense

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
- Docker (optional, for containerized deployment)

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
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
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
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Architecture Overview

The application follows a modern three-tier architecture:

### System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│  Supabase   │
│   (React)   │◀────────│  (FastAPI)  │◀────────│  (Database) │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌───────────────┐   ┌───────────────┐
            │  OCR Engine   │   │  Web Scrapers │
            │   (Gemini)    │   │  (4D & Toto)  │
            └───────────────┘   └───────────────┘
```

### Component Breakdown

#### Frontend Layer
- **React + Vite**: Modern, fast development experience
- **React Router**: Client-side routing for SPA navigation
- **Axios**: HTTP client for API communication
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Supabase Client**: Direct authentication and real-time subscriptions

#### Backend Layer
- **FastAPI**: High-performance Python web framework
  - Async/await support for concurrent operations
  - Automatic API documentation (Swagger/OpenAPI)
  - Type validation with Pydantic
- **OCR Module**: Image processing using Google Gemini AI
  - Timeout handling for reliable processing
  - Support for multiple image formats (PNG, JPEG, WEBP, BMP)
- **Web Scrapers**: Automated data collection
  - 4D scraper for Singapore 4D results
  - Toto scraper for Singapore Toto results
- **Services Layer**: Business logic and integrations
  - Ticket validation and checking
  - Notification generation
  - Result comparison algorithms

#### Database Layer
- **Supabase (PostgreSQL)**: Cloud-hosted database
  - User authentication and authorization
  - Ticket storage and management
  - Draw results archival
  - Notification persistence
  - Prediction logs

### Data Flow

1. **Ticket Upload Flow**
   ```
   User uploads image → FastAPI receives file → OCR processes image → 
   Extracted data validated → Stored in Supabase → Response to user
   ```

2. **Result Checking Flow**
   ```
   Scheduled job → Scrapers fetch results → Results stored in DB → 
   Checker compares tickets → Wins detected → Notifications generated
   ```

3. **Prediction Flow**
   ```
   Historical data collected → Backfill scripts populate data → 
   ML models generate predictions → Stored in DB → Served via API
   ```

## API Endpoints

### Base URL
- Development: `http://localhost:8000`
- API Prefix: `/api`

### Authentication
All endpoints except root require authentication via Supabase JWT token.
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Tickets API

#### Upload Ticket
```http
POST /api/tickets/upload
```

Upload and process a lottery ticket image using OCR.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file - PNG, JPEG, WEBP, or BMP)
- Max file size: 5MB

**Response (4D Ticket):**
```json
{
  "status": "success",
  "message": "Ticket processed successfully",
  "data": {
    "game_type": "4D",
    "draw_date": "2025-04-23",
    "ticket_price": 60.0,
    "fourd_bets": [
      {
        "entry_type": "Ordinary",
        "number": "5716",
        "roll_pattern": null,
        "big_amount": 10.0,
        "small_amount": 10.0,
        "permutations": null
      },
      {
        "entry_type": "Ordinary",
        "number": "4145",
        "roll_pattern": null,
        "big_amount": 10.0,
        "small_amount": 10.0,
        "permutations": null
      },
      {
        "entry_type": "Ordinary",
        "number": "4045",
        "roll_pattern": null,
        "big_amount": 10.0,
        "small_amount": 10.0,
        "permutations": null
      }
    ],
    "toto_entries": null,
    "toto_entry": null
  }
}
```

**Response (TOTO Ticket):**
```json
{
  "status": "success",
  "message": "Ticket processed successfully",
  "data": {
    "game_type": "TOTO",
    "draw_date": "2026-01-22",
    "ticket_price": 14,
    "fourd_bets": null,
    "toto_entries": [
      {
        "label": "A",
        "numbers": [5, 10, 13, 18, 21, 27, 37],
        "bet_type": "System",
        "system_roll": null,
        "system_size": 7
      },
      {
        "label": "B",
        "numbers": [2, 17, 30, 37, 38, 41, 43],
        "bet_type": "System",
        "system_roll": null,
        "system_size": 7
      }
    ],
    "toto_entry": null
  }
}
```

**Data Fields:**
- `game_type`: Type of lottery game (`4D` or `TOTO`)
- `draw_date`: Date of the draw (ISO format)
- `ticket_price`: Total price paid for the ticket
- `fourd_bets`: Array of 4D bet entries (null for TOTO tickets)
  - `entry_type`: Bet type (e.g., `Ordinary`, `System`, `iBet`)
  - `number`: 4-digit number
  - `big_amount`: Amount bet on Big prize
  - `small_amount`: Amount bet on Small prize
  - `roll_pattern`: Roll pattern if applicable (e.g., `R123`)
  - `permutations`: Array of permutation numbers if System bet
- `toto_entries`: Array of TOTO entries (null for 4D tickets)
  - `label`: Entry label (e.g., `A`, `B`, `C`)
  - `numbers`: Selected numbers (6 for Ordinary, 7+ for System)
  - `bet_type`: Entry type (e.g., `Ordinary`, `System`)
  - `system_roll`: Roll number if applicable (e.g., `1`, `2`)
  - `system_size`: Number of selected numbers for System bets (7, 8, 9, etc.)
- `toto_entry`: Legacy field (always null)

**Error Responses:**
- `400`: Invalid file type
- `413`: File too large
- `422`: Validation error or OCR processing error
- `500`: Unexpected server error
- `504`: OCR timeout

---

#### List Tickets
```http
GET /api/tickets/
```

Retrieve all tickets for the authenticated user, ordered by creation date (newest first).

**Response (4D Ticket):**
```json
{
  "status": "success",
  "tickets": [
    {
      "id": "3a70c075-cc4e-47f3-b52c-17e6a950ac85",
      "user_id": "913b939b-fbb8-47ce-8372-d8b52817babe",
      "game_type": "4D",
      "draw_date": "2025-04-16",
      "ticket_price": 120.0,
      "status": "draft",
      "created_at": "2026-01-26T10:53:37.977643+00:00",
      "details": {
        "game_type": "4D",
        "draw_date": "2025-04-16",
        "ticket_price": 120,
        "fourd_bets": [
          {
            "entry_type": "Ordinary",
            "number": "0616",
            "roll_pattern": null,
            "big_amount": 20,
            "small_amount": 20,
            "permutations": null
          },
          {
            "entry_type": "Ordinary",
            "number": "0193",
            "roll_pattern": null,
            "big_amount": 20,
            "small_amount": 20,
            "permutations": null
          },
          {
            "entry_type": "Ordinary",
            "number": "2028",
            "roll_pattern": null,
            "big_amount": 20,
            "small_amount": 20,
            "permutations": null
          }
        ],
        "toto_entries": null,
        "toto_entry": null
      }
    }
  ]
}
```

**Response (TOTO Ticket):**
```json
{
  "status": "success",
  "tickets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "game_type": "TOTO",
      "draw_date": "2026-01-22",
      "ticket_price": 14,
      "status": "draft",
      "created_at": "2026-01-26T11:00:00+00:00",
      "details": {
        "game_type": "TOTO",
        "draw_date": "2026-01-22",
        "ticket_price": 14,
        "fourd_bets": null,
        "toto_entries": [
          {
            "label": "A",
            "numbers": [5, 10, 13, 18, 21, 27, 37],
            "bet_type": "System",
            "system_roll": null,
            "system_size": 7
          }
        ],
        "toto_entry": null
      }
    }
  ]
}
```

**Fields:**
- `id`: Unique ticket identifier (UUID)
- `user_id`: Owner's user ID (UUID)
- `game_type`: `4D` or `TOTO`
- `draw_date`: Draw date (ISO format)
- `ticket_price`: Total amount paid
- `status`: Ticket status (e.g., `draft`, `active`)
- `created_at`: Creation timestamp (ISO format with timezone)
- `details`: Full ticket data (same structure as upload response data field)

---

#### Delete Ticket
```http
DELETE /api/tickets/{ticket_id}
```

Delete a specific ticket owned by the authenticated user.

**Parameters:**
- `ticket_id` (path): UUID of the ticket to delete

**Response:**
```json
{
  "message": "Ticket deleted successfully"
}
```

**Error Responses:**
- `404`: Ticket not found or unauthorized
- `500`: Server error

---

### Notifications API

#### Get Notifications
```http
GET /api/notifications
```

Retrieve all notifications for the authenticated user.

**Response (TOTO Win):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "win",
      "title": "🎉 Congratulations! You Won!",
      "message": "Your ticket has won a prize in the latest TOTO draw!",
      "data": {
        "draw_no": 4071,
        "draw_date": "2025-04-21",
        "game_type": "TOTO",
        "ticket_id": "10e088ba-6008-4b6c-bdaa-407a784af473",
        "prize_group": 3,
        "prize_amount": 4302,
        "total_payout": 4302,
        "ticket_numbers": [
          {
            "label": "A",
            "numbers": [5, 10, 13, 18, 21, 27, 37]
          },
          {
            "label": "B",
            "numbers": [2, 17, 30, 37, 38, 41, 43]
          }
        ],
        "winning_combos": [
          {
            "combination": [2, 17, 30, 37, 41, 43],
            "prize_group": 3,
            "main_matches": 5,
            "has_additional": false
          },
          {
            "combination": [17, 30, 37, 38, 41, 43],
            "prize_group": 3,
            "main_matches": 5,
            "has_additional": false
          }
        ],
        "counts_by_group": {
          "3": 2,
          "5": 5
        },
        "ticket_check_id": "6af8401e-5c95-4114-b4df-ffc19a2ae718",
        "draw_winning_numbers": {
          "winning_numbers": [1, 17, 30, 37, 41, 43],
          "additional_number": 32
        },
        "winning_combinations": 7
      },
      "is_read": false,
      "created_at": "2026-01-26T10:30:00Z"
    }
  ]
}
```

**Data Fields (TOTO):**
- `draw_no`: Draw number
- `draw_date`: Draw date (ISO format)
- `game_type`: `TOTO`
- `ticket_id`: ID of the winning ticket (UUID)
- `prize_group`: Highest prize group won (1-7)
- `prize_amount`: Total prize amount won
- `total_payout`: Total payout amount
- `ticket_numbers`: Array of ticket entries with labels and selected numbers
- `winning_combos`: Array of winning combinations from the ticket
  - `combination`: The 6 numbers that won
  - `prize_group`: Prize group for this combination
  - `main_matches`: Number of main number matches
  - `has_additional`: Whether additional number was matched
- `counts_by_group`: Count of wins per prize group
- `ticket_check_id`: ID of the check operation (UUID)
- `draw_winning_numbers`: Winning numbers for the draw
  - `winning_numbers`: Array of 6 main winning numbers
  - `additional_number`: Additional number
- `winning_combinations`: Total number of winning combinations

---

#### Mark Notification as Read
```http
PATCH /api/notifications/{notification_id}/read
```

Mark a specific notification as read.

**Parameters:**
- `notification_id` (path): ID of the notification

**Response:**
```json
{
  "message": "Notification marked as read",
  "notification": { /* notification object */ }
}
```

**Error Responses:**
- `404`: Notification not found or unauthorized
- `500`: Server error

---

#### Mark All Notifications as Read
```http
PATCH /api/notifications/mark-all-read
```

Mark all notifications as read for the authenticated user.

**Response:**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

#### Delete Notification
```http
DELETE /api/notifications/{notification_id}
```

Delete a specific notification.

**Parameters:**
- `notification_id` (path): ID of the notification to delete

---

### Predictions API

#### Get Predictions
```http
GET /api/predictions/{game_type}
```

Get AI-powered predictions for the next draw (educational purposes only).

**Parameters:**
- `game_type` (path): Either `4D` or `TOTO`

**Response:**
```json
{
  "disclaimer": "For educational purposes only. Not financial advice.",
  "game_type": "4D",
  "predictions": [
    {
      "model_name": "Model A",
      "predicted_numbers": ["1234", "5678"],
      "confidence_score": 0.75,
      "rationale": "AI model prediction based on historical draw patterns and statistical analysis."
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid game_type (must be '4D' or 'TOTO')
- `500`: Failed to fetch predictions

---

#### Get Historical Draws
```http
GET /api/predictions/history/{game_type}?limit=100
```

Retrieve historical draw data for analysis.

**Parameters:**
- `game_type` (path): Either `4D` or `TOTO`
- `limit` (query, optional): Number of records to return (default: 100)

**Status:** Not yet implemented (501)

---

### Root Endpoint

#### Health Check
```http
GET /
```

Check if the API is running.

**Response:**
```json
{
  "message": "Welcome to the FastAPI backend!"
}
```

---

## Project Structure

```
4D-Toto-Application/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── tickets.py           # Ticket management endpoints
│   │   │   ├── notifications.py     # Notification endpoints
│   │   │   └── predictions.py       # Prediction endpoints
│   │   ├── models/       # Data models
│   │   │   ├── draw.py              # Draw result models
│   │   │   └── ticket.py            # Ticket models
│   │   ├── ocr/          # OCR engine
│   │   │   ├── ocr_engine.py        # Gemini AI integration
│   │   │   └── ocr_timeout.py       # Timeout handling
│   │   ├── prediction/   # ML prediction models
│   │   │   ├── backfill_4d.py       # Historical 4D data
│   │   │   ├── backfill_toto.py     # Historical Toto data
│   │   │   ├── prediction_4d.py     # 4D prediction logic
│   │   │   └── prediction_toto.py   # Toto prediction logic
│   │   ├── scrapers/     # Result scrapers
│   │   │   ├── fourd.py             # 4D result scraper
│   │   │   └── toto.py              # Toto result scraper
│   │   ├── services/     # Business logic
│   │   │   ├── dbconfig.py          # Database configuration
│   │   │   ├── fourd_checker.py     # 4D ticket checker
│   │   │   ├── toto_checker.py      # Toto ticket checker
│   │   │   ├── ticket_checker.py    # Generic ticket checker
│   │   │   └── notification_generator.py  # Notification logic
│   │   └── main.py       # FastAPI application entry point
│   ├── scripts/          # Utility scripts
│   │   └── check_and_notify.py      # Automated checking script
│   ├── tests/            # Unit tests
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend container config
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationCard.jsx
│   │   │   ├── PredictionCard.jsx
│   │   │   ├── TicketDetails.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── UploadTicket.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── PredictionPage.jsx
│   │   │   ├── Verify.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── services/     # API clients
│   │   │   ├── api.js               # Axios API client
│   │   │   └── supabaseClient.js    # Supabase client
│   │   ├── App.jsx       # Main application component
│   │   └── main.jsx      # Application entry point
│   ├── package.json      # Node.js dependencies
│   ├── vite.config.js    # Vite configuration
│   └── Dockerfile        # Frontend container config
├── docker-compose.yml    # Multi-container orchestration
└── README.md
```

## Environment Variables

### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
```

## API Documentation

When the backend is running, interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## License


This project is licensed under the MIT License.
