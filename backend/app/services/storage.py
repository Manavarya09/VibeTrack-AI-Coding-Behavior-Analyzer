import boto3
import os
from typing import Optional


class StorageService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = os.getenv("S3_BUCKET", "vibetrack-uploads")
        self.use_s3 = bool(os.getenv("AWS_ACCESS_KEY_ID"))

        if self.use_s3:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1"),
            )

    def upload_file(self, file_path: str, key: str) -> Optional[str]:
        if not self.s3_client:
            return None

        try:
            self.s3_client.upload_file(file_path, self.bucket_name, key)
            return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
        except Exception as e:
            print(f"Upload failed: {e}")
            return None

    def upload_data(
        self, data: bytes, key: str, content_type: str = "application/octet-stream"
    ) -> Optional[str]:
        if not self.s3_client:
            return None

        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name, Key=key, Body=data, ContentType=content_type
            )
            return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
        except Exception as e:
            print(f"Upload failed: {e}")
            return None

    def delete_file(self, key: str) -> bool:
        if not self.s3_client:
            return False

        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception as e:
            print(f"Delete failed: {e}")
            return False

    def get_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        if not self.s3_client:
            return None

        try:
            return self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expiration,
            )
        except Exception as e:
            print(f"Presigned URL failed: {e}")
            return None


storage_service = StorageService()
