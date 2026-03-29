from typing import Dict, Any
import json


class TaskQueue:
    def __init__(self):
        self.tasks = []
        self.completed = []

    def add_task(self, task_type: str, task_data: Dict, priority: int = 5) -> str:
        task_id = f"task_{len(self.tasks)}_{task_type}"
        task = {
            "id": task_id,
            "type": task_type,
            "data": task_data,
            "priority": priority,
            "status": "pending",
        }
        self.tasks.append(task)
        self.tasks.sort(key=lambda x: x["priority"], reverse=True)
        return task_id

    def get_task(self) -> Dict:
        if self.tasks:
            task = self.tasks.pop(0)
            task["status"] = "processing"
            return task
        return None

    def complete_task(self, task_id: str, result: Any = None):
        for task in self.completed:
            if task["id"] == task_id:
                task["status"] = "completed"
                task["result"] = result
                return
        self.completed.append({"id": task_id, "status": "completed", "result": result})

    def get_status(self, task_id: str) -> Dict:
        for task in self.tasks + self.completed:
            if task["id"] == task_id:
                return task
        return None


task_queue = TaskQueue()
