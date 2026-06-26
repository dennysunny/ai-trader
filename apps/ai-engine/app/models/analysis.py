from pydantic import BaseModel

class MarketAnalysisRequest(BaseModel):
    symbol: str
    ltp: float