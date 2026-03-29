from typing import Dict, Any, List, Optional
import httpx
import asyncio
from datetime import datetime


class WebhookManager:
    def __init__(self):
        self.webhooks: Dict[str, List[str]] = {
            "session_start": [],
            "session_end": [],
            "high_dependency": [],
            "deep_flow": [],
        }

    def register_webhook(self, event_type: str, url: str) -> bool:
        if event_type not in self.webhooks:
            return False
        if url not in self.webhooks[event_type]:
            self.webhooks[event_type].append(url)
        return True

    def remove_webhook(self, event_type: str, url: str) -> bool:
        if event_type in self.webhooks and url in self.webhooks[event_type]:
            self.webhooks[event_type].remove(url)
            return True
        return False

    async def trigger(self, event_type: str, data: Dict[str, Any]) -> List[Dict]:
        if event_type not in self.webhooks:
            return []

        results = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            tasks = []
            for url in self.webhooks[event_type]:
                task = self._send_webhook(client, url, event_type, data)
                tasks.append(task)

            results = await asyncio.gather(*tasks, return_exceptions=True)

        return [r for r in results if not isinstance(r, Exception)]

    async def _send_webhook(
        self, client: httpx.AsyncClient, url: str, event_type: str, data: Dict
    ) -> Dict:
        payload = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
        }

        try:
            response = await client.post(url, json=payload)
            return {
                "url": url,
                "status": response.status_code,
                "success": response.status_code < 400,
            }
        except Exception as e:
            return {"url": url, "status": 0, "success": False, "error": str(e)}


webhook_manager = WebhookManager()
