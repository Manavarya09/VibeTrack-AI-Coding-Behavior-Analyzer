from fastapi import APIRouter
from app.services.metrics import metrics

router = APIRouter()


@router.get("/metrics")
def get_metrics():
    return metrics.get_metrics()


@router.post("/metrics/reset")
def reset_metrics():
    metrics.reset()
    return {"message": "Metrics reset"}
