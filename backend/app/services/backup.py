from typing import Dict, List
import json


class BackupService:
    def __init__(self):
        self.backups = []

    def create_backup(self, data: Dict, backup_type: str = "manual") -> Dict:
        import time

        backup = {
            "id": len(self.backups) + 1,
            "type": backup_type,
            "timestamp": time.time(),
            "data": data,
            "size": len(json.dumps(data)),
        }
        self.backups.append(backup)
        return backup

    def list_backups(self) -> List[Dict]:
        return [
            {
                "id": b["id"],
                "type": b["type"],
                "timestamp": b["timestamp"],
                "size": b["size"],
            }
            for b in self.backups
        ]

    def restore_backup(self, backup_id: int) -> Dict:
        for backup in self.backups:
            if backup["id"] == backup_id:
                return backup["data"]
        return {}


backup_service = BackupService()
