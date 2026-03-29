from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@vibetrack.app")
        self.enabled = bool(self.smtp_host and self.smtp_user)

    def send_email(
        self, to_email: str, subject: str, body: str, html: str = None
    ) -> bool:
        if not self.enabled:
            print(f"Email would be sent (disabled): {to_email} - {subject}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "plain"))
            if html:
                msg.attach(MIMEText(html, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Email failed: {e}")
            return False

    def send_welcome_email(self, to_email: str, username: str) -> bool:
        subject = "Welcome to VibeTrack"
        body = f"""Hi {username},

Welcome to VibeTrack! We're excited to help you track your AI-assisted coding behavior.

Get started by:
1. Opening the dashboard
2. Starting your first session
3. Logging your AI interactions

Happy coding!

- The VibeTrack Team
"""
        return self.send_email(to_email, subject, body)

    def send_session_summary(
        self, to_email: str, username: str, session_data: Dict
    ) -> bool:
        subject = f"Your VibeTrack Session Summary"
        body = f"""Hi {username},

Here's your session summary:

Duration: {session_data.get("duration", 0)} minutes
Prompts: {session_data.get("prompt_count", 0)}
Vibe Score: {session_data.get("vibe_score", "N/A")}
Classification: {session_data.get("classification", "N/A")}

- The VibeTrack Team
"""
        return self.send_email(to_email, subject, body)


email_service = EmailService()
