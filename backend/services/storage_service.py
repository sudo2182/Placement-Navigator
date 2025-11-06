"""
S3/MinIO Storage Service for file uploads
Supports both AWS S3 and MinIO
"""
import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class StorageService:
    """Service for storing files in S3 or MinIO"""
    
    def __init__(self):
        """Initialize storage service with S3/MinIO configuration"""
        # Check if using MinIO (local development) or AWS S3
        self.use_minio = os.getenv("USE_MINIO", "false").lower() == "true"
        
        if self.use_minio:
            # MinIO configuration
            self.endpoint_url = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
            self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
            self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
            self.region = os.getenv("MINIO_REGION", "us-east-1")
            
            self.client = boto3.client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                config=Config(signature_version='s3v4'),
                region_name=self.region
            )
        else:
            # AWS S3 configuration
            self.region = os.getenv("AWS_REGION", "us-east-1")
            # Only create client if credentials are available
            # For development, we'll allow missing credentials (will fail gracefully on upload)
            try:
                self.client = boto3.client('s3', region_name=self.region)
                # Test connection
                try:
                    self.client.list_buckets()
                except Exception:
                    logger.warning("S3 credentials may be invalid. Uploads may fail.")
            except NoCredentialsError:
                logger.warning("AWS credentials not found. S3 uploads will fail. Set USE_MINIO=true for local development.")
                self.client = None
        
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "placement-navigator")
        
    def upload_file(self, file_content: bytes, file_key: str, content_type: str = "application/pdf") -> bool:
        """
        Upload file to S3/MinIO
        
        Args:
            file_content: File content as bytes
            file_key: S3 object key (path in bucket)
            content_type: MIME type of the file
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.error("Storage client not initialized")
            return False
        
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                ContentType=content_type
            )
            logger.info(f"File uploaded successfully: {file_key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to upload file {file_key}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error uploading file {file_key}: {str(e)}")
            return False
    
    def get_file_url(self, file_key: str, expires_in: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for file access
        
        Args:
            file_key: S3 object key
            expires_in: URL expiration time in seconds
            
        Returns:
            Presigned URL or None if error
        """
        if not self.client:
            return None
        
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for {file_key}: {str(e)}")
            return None
    
    def delete_file(self, file_key: str) -> bool:
        """
        Delete file from S3/MinIO
        
        Args:
            file_key: S3 object key
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            return False
        
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=file_key)
            logger.info(f"File deleted successfully: {file_key}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete file {file_key}: {str(e)}")
            return False

# Global instance
storage_service = StorageService()

