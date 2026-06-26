from fastapi import APIRouter

router = APIRouter()

@router.post("/analysis")
def analysis(data: dict):
    return {
        "message": "Analysis endpoint is working",
        "data": data
    }