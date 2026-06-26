from fastapi import APIRouter

router = APIRouter()

@router.get("/recommendations")
def get_recommendations():
    return {
        "message": "Recommendations endpoint is working"
    }