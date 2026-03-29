from cryptography.fernet import Fernet
import base64
import os


class EncryptionService:
    def __init__(self):
        key = os.getenv("ENCRYPTION_KEY")
        if key:
            self.cipher = Fernet(base64.urlsafe_b64encode(key.encode().ljust(32)[:32]))
        else:
            self.cipher = None

    def encrypt(self, data: str) -> str:
        if not self.cipher:
            return data
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt(self, data: str) -> str:
        if not self.cipher:
            return data
        return self.cipher.decrypt(data.encode()).decode()

    def hash_data(self, data: str) -> str:
        import hashlib

        return hashlib.sha256(data.encode()).hexdigest()


encryption_service = EncryptionService()
