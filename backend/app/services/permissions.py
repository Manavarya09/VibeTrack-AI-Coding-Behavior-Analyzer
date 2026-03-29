from typing import List, Set


class Permission:
    READ_SESSIONS = "read:sessions"
    WRITE_SESSIONS = "write:sessions"
    READ_EVENTS = "read:events"
    WRITE_EVENTS = "write:events"
    READ_STATS = "read:stats"
    ADMIN_USERS = "admin:users"
    ADMIN_SYSTEM = "admin:system"


ROLE_PERMISSIONS = {
    "user": [
        Permission.READ_SESSIONS,
        Permission.WRITE_SESSIONS,
        Permission.READ_EVENTS,
        Permission.WRITE_EVENTS,
        Permission.READ_STATS,
    ],
    "admin": [
        Permission.READ_SESSIONS,
        Permission.WRITE_SESSIONS,
        Permission.READ_EVENTS,
        Permission.WRITE_EVENTS,
        Permission.READ_STATS,
        Permission.ADMIN_USERS,
        Permission.ADMIN_SYSTEM,
    ],
}


class PermissionService:
    def __init__(self):
        self.user_permissions = {}

    def assign_role(self, user_id: int, role: str):
        self.user_permissions[user_id] = set(ROLE_PERMISSIONS.get(role, []))

    def add_permission(self, user_id: int, permission: str):
        if user_id not in self.user_permissions:
            self.user_permissions[user_id] = set()
        self.user_permissions[user_id].add(permission)

    def has_permission(self, user_id: int, permission: str) -> bool:
        if user_id not in self.user_permissions:
            return False
        return permission in self.user_permissions[user_id]

    def get_permissions(self, user_id: int) -> Set[str]:
        return self.user_permissions.get(user_id, set())


permission_service = PermissionService()
