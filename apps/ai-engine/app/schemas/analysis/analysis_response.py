from pydantic import BaseModel

class IndicatorSet(BaseModel):
    rsi: float
    ema20: float
    ema50: float


class MarketContext(BaseModel):
    trend: str
    momentum: str


class Recommendation(BaseModel):
    action: str
    confidence: int


class AnalysisResponse(BaseModel):
    indicators: IndicatorSet
    context: MarketContext
    recommendation: Recommendation