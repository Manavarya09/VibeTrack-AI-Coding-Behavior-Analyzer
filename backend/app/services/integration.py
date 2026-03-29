from typing import Dict, Any, List
import requests


class SlackIntegration:
    def __init__(self):
        self.webhook_url = None

    def set_webhook(self, url: str):
        self.webhook_url = url

    def send_message(self, message: str, channel: str = None) -> bool:
        if not self.webhook_url:
            return False

        payload = {"text": message}
        if channel:
            payload["channel"] = channel

        try:
            response = requests.post(self.webhook_url, json=payload)
            return response.status_code == 200
        except:
            return False

    def send_session_alert(self, session_data: Dict) -> bool:
        message = f"Session Alert: {session_data.get('classification')}\nDuration: {session_data.get('duration_minutes')} min\nVibe Score: {session_data.get('vibe_score')}"
        return self.send_message(message)


class DiscordIntegration:
    def __init__(self):
        self.webhook_url = None

    def set_webhook(self, url: str):
        self.webhook_url = url

    def send_embed(
        self,
        title: str,
        description: str,
        color: int = 0x6366F1,
        fields: List[Dict] = None,
    ) -> bool:
        if not self.webhook_url:
            return False

        payload = {
            "embeds": [
                {
                    "title": title,
                    "description": description,
                    "color": color,
                    "fields": fields or [],
                }
            ]
        }

        try:
            response = requests.post(self.webhook_url, json=payload)
            return response.status_code == 200
        except:
            return False


slack_integration = SlackIntegration()
discord_integration = DiscordIntegration()
