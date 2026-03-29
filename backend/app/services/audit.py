from typing import Dict, Any, List
from datetime import datetime


class AuditLog:
    def __init__(self):
        self.logs = []

    def log(self, action: str, user_id: int, details: Dict[str, Any] = None):
        entry = {
            "id": len(self.logs) + 1,
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "user_id": user_id,
            "details": details or {},
        }
        self.logs.append(entry)
        return entry

    def get_logs(self, user_id: int = None, limit: int = 100) -> List[Dict]:
        logs = self.logs
        if user_id:
            logs = [l for l in logs if l["user_id"] == user_id]
        return logs[-limit:]

    def search(self, query: str) -> List[Dict]:
        return [l for l in self.logs if query.lower() in str(l).lower()]


audit_log = AuditLog()
