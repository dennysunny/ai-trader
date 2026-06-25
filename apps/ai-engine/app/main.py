from fastapi import FastAPI

app = FastAPI(
    title="AI Trading Engine",
    version="1.0.0 Alpha"
)

@app.get("/")
def root():
    return {
        "application": "AI Trading Engine",
        "status": "Running"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }