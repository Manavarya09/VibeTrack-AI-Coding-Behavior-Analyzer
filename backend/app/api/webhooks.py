from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List
from app.services.webhooks import webhook_manager

router = APIRouter()


class WebhookCreate(BaseModel):
    event_type: str
    url: str


class WebhookResponse(BaseModel):
    event_type: str
    url: str


class WebhookListResponse(BaseModel):
    webhooks: dict


@router.post("/webhooks", response_model=WebhookResponse)
def register_webhook(webhook: WebhookCreate):
    valid_events = ["session_start", "session_end", "high_dependency", "deep_flow"]
    if webhook.event_type not in valid_events:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event type. Must be one of: {valid_events}",
        )

    success = webhook_manager.register_webhook(webhook.event_type, webhook.url)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to register webhook")

    return webhook


@router.delete("/webhooks")
def remove_webhook(webhook: WebhookCreate):
    success = webhook_manager.remove_webhook(webhook.event_type, webhook.url)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return {"message": "Webhook removed"}


@router.get("/webhooks", response_model=WebhookListResponse)
def list_webhooks():
    return {"webhooks": webhook_manager.webhooks}


@router.post("/webhooks/test")
async def test_webhook(url: str):
    result = await webhook_manager.trigger("test", {"message": "Test webhook"})
    return {"results": result}
