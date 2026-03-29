from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    read: bool = False
    created_at: datetime


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str = "info"


notifications_db = []


@router.get("/notifications", response_model=List[Notification])
def get_notifications(user_id: int, unread_only: bool = False):
    user_notifications = [n for n in notifications_db if n["user_id"] == user_id]
    if unread_only:
        user_notifications = [n for n in user_notifications if not n["read"]]
    return user_notifications


@router.post("/notifications")
def create_notification(notif: NotificationCreate):
    notification = Notification(
        id=len(notifications_db) + 1,
        user_id=notif.user_id,
        title=notif.title,
        message=notif.message,
        type=notif.type,
        created_at=datetime.utcnow(),
    )
    notifications_db.append(notification.dict())
    return notification


@router.put("/notifications/{notification_id}/read")
def mark_as_read(notification_id: int):
    for n in notifications_db:
        if n["id"] == notification_id:
            n["read"] = True
            return {"message": "Marked as read"}
    return {"error": "Notification not found"}


@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int):
    global notifications_db
    notifications_db = [n for n in notifications_db if n["id"] != notification_id]
    return {"message": "Notification deleted"}
