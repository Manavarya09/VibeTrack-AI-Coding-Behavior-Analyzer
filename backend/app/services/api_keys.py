from typing import List, Optional
from datetime import datetime, timedelta
import secrets
import hashlib


class APIKeyManager:
    def __init__(self):
        self.api_keys = {}

    def generate_key(
        self, user_id: int, name: str = "Default", expires_days: int = 365
    ) -> dict:
        key = f"vk_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(key.encode()).hexdigest()

        expires_at = datetime.utcnow() + timedelta(days=expires_days)

        api_key = {
            "id": len(self.api_keys) + 1,
            "user_id": user_id,
            "name": name,
            "key_hash": key_hash,
            "key_prefix": key[:8],
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_active": True,
            "last_used": None,
        }

        self.api_keys[key_hash] = api_key

        return {**api_key, "key": key}

    def verify_key(self, key: str) -> Optional[dict]:
        key_hash = hashlib.sha256(key.encode()).hexdigest()

        if key_hash not in self.api_keys:
            return None

        api_key = self.api_keys[key_hash]

        if not api_key["is_active"]:
            return None

        if api_key["expires_at"] < datetime.utcnow():
            return None

        api_key["last_used"] = datetime.utcnow()

        return api_key

    def revoke_key(self, key_id: int) -> bool:
        for key in self.api_keys.values():
            if key["id"] == key_id:
                key["is_active"] = False
                return True
        return False

    def list_keys(self, user_id: int) -> List[dict]:
        return [
            {k: v for k, v in key.items() if k != "key_hash" and k != "key"}
            for key in self.api_keys.values()
            if key["user_id"] == user_id
        ]


api_key_manager = APIKeyManager()
