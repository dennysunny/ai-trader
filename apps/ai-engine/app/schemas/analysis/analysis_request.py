from pydantic import BaseModel
from typing import List

class Candle(BaseModel):
    open: float
    high: float
    low: float
    close: float
    volume: float


class Instrument(BaseModel):
    symbol: str
    exchange: str
    instrument_type: str
    
class AnalysisRequest(BaseModel):
    instrument: Instrument
    candles: List[Candle]