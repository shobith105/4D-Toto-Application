from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tickets, results, predictions

app = FastAPI()

# Include routers
app.include_router(tickets.router, prefix="/api")
app.include_router(results.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or specify ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}