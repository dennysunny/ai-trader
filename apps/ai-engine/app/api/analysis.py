from fastapi import APIRouter
from ..models.analysis import MarketAnalysisRequest

router = APIRouter()

@router.post("/analyze")
def analyze(request: MarketAnalysisRequest):
    return {
        "message": "analyze endpoint is working",
        "symbol": request.symbol,
        "ltp": request.ltp
    }