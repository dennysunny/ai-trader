from fastapi import FastAPI
from .api.router import api_router

app = FastAPI(
    title="AI Trading Engine",
    version="1.0.0 Alpha"
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "application": "AI Trading Engine",
        "status": "Running"
    }
