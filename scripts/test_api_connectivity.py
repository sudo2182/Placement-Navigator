#!/usr/bin/env python3
"""
API Connectivity Check Script
Tests all external services and API integrations
"""
import os
import sys
import asyncio
import httpx
from typing import Dict, Any, List
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

class ConnectivityChecker:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []
    
    def check_env_var(self, var_name: str, required: bool = False) -> Dict[str, Any]:
        """Check if environment variable is set"""
        value = os.getenv(var_name)
        exists = value is not None and value != ""
        
        result = {
            "service": f"Environment Variable: {var_name}",
            "status": "PASS" if exists else ("FAIL" if required else "WARN"),
            "message": f"Set: {exists}",
            "required": required,
            "where_used": self._get_where_used(var_name)
        }
        
        if not exists and required:
            result["fix"] = f"Set {var_name} in .env file or environment"
        
        self.results.append(result)
        return result
    
    def _get_where_used(self, var_name: str) -> str:
        """Map env vars to where they're used"""
        mapping = {
            "DATABASE_URL": "shared/models.py, backend/auth.py",
            "JWT_SECRET_KEY": "backend/auth.py",
            "OPENAI_API_KEY": "backend/services/matching_service.py",
            "GITHUB_TOKEN": "backend/routers/github.py",
            "AWS_ACCESS_KEY_ID": "backend/services/storage_service.py",
            "AWS_SECRET_ACCESS_KEY": "backend/services/storage_service.py",
            "AWS_REGION": "backend/services/storage_service.py",
            "S3_BUCKET_NAME": "backend/services/storage_service.py",
            "USE_MINIO": "backend/services/storage_service.py",
            "MINIO_ENDPOINT": "backend/services/storage_service.py",
            "MINIO_ACCESS_KEY": "backend/services/storage_service.py",
            "MINIO_SECRET_KEY": "backend/services/storage_service.py",
        }
        return mapping.get(var_name, "Unknown")
    
    async def check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            from shared.models import get_db, engine
            # Try to connect
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            
            result = {
                "service": "PostgreSQL Database",
                "status": "PASS",
                "message": "Database connection successful",
                "where_used": "shared/models.py"
            }
        except Exception as e:
            result = {
                "service": "PostgreSQL Database",
                "status": "FAIL",
                "message": f"Connection failed: {str(e)}",
                "where_used": "shared/models.py",
                "fix": "Check DATABASE_URL in .env file. Ensure PostgreSQL is running."
            }
        
        self.results.append(result)
        return result
    
    async def check_openai(self) -> Dict[str, Any]:
        """Check OpenAI API connectivity"""
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            result = {
                "service": "OpenAI API",
                "status": "WARN",
                "message": "OPENAI_API_KEY not set (optional)",
                "where_used": "backend/services/matching_service.py",
                "fix": "Set OPENAI_API_KEY for AI-powered matching. System will use rule-based fallback."
            }
        else:
            try:
                import openai
                client = openai.OpenAI(api_key=api_key)
                # Simple test - list models (lightweight)
                client.models.list(limit=1)
                
                result = {
                    "service": "OpenAI API",
                    "status": "PASS",
                    "message": "OpenAI API accessible",
                    "where_used": "backend/services/matching_service.py"
                }
            except Exception as e:
                result = {
                    "service": "OpenAI API",
                    "status": "FAIL",
                    "message": f"API test failed: {str(e)}",
                    "where_used": "backend/services/matching_service.py",
                    "fix": "Verify OPENAI_API_KEY is valid. Check OpenAI account status."
                }
        
        self.results.append(result)
        return result
    
    async def check_github(self) -> Dict[str, Any]:
        """Check GitHub API connectivity"""
        token = os.getenv("GITHUB_TOKEN")
        
        if not token:
            result = {
                "service": "GitHub API",
                "status": "WARN",
                "message": "GITHUB_TOKEN not set (optional)",
                "where_used": "backend/routers/github.py",
                "fix": "Set GITHUB_TOKEN for GitHub profile analysis. Create token at https://github.com/settings/tokens"
            }
        else:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(
                        "https://api.github.com/user",
                        headers={"Authorization": f"token {token}"}
                    )
                    
                    if response.status_code == 200:
                        result = {
                            "service": "GitHub API",
                            "status": "PASS",
                            "message": "GitHub API accessible",
                            "where_used": "backend/routers/github.py"
                        }
                    else:
                        result = {
                            "service": "GitHub API",
                            "status": "FAIL",
                            "message": f"GitHub API returned {response.status_code}",
                            "where_used": "backend/routers/github.py",
                            "fix": "Verify GITHUB_TOKEN is valid. Token may be expired or have insufficient permissions."
                        }
            except Exception as e:
                result = {
                    "service": "GitHub API",
                    "status": "FAIL",
                    "message": f"Connection failed: {str(e)}",
                    "where_used": "backend/routers/github.py",
                    "fix": "Check network connectivity and token validity."
                }
        
        self.results.append(result)
        return result
    
    async def check_storage(self) -> Dict[str, Any]:
        """Check S3/MinIO storage connectivity"""
        use_minio = os.getenv("USE_MINIO", "false").lower() == "true"
        
        if use_minio:
            endpoint = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
            access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
            secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
            
            if not access_key or not secret_key:
                result = {
                    "service": "MinIO Storage",
                    "status": "WARN",
                    "message": "MinIO credentials not fully configured",
                    "where_used": "backend/services/storage_service.py",
                    "fix": "Set MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, S3_BUCKET_NAME"
                }
            else:
                try:
                    import boto3
                    from botocore.client import Config
                    client = boto3.client(
                        's3',
                        endpoint_url=endpoint,
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        config=Config(signature_version='s3v4')
                    )
                    client.list_buckets()
                    
                    result = {
                        "service": "MinIO Storage",
                        "status": "PASS",
                        "message": f"MinIO accessible at {endpoint}",
                        "where_used": "backend/services/storage_service.py"
                    }
                except Exception as e:
                    result = {
                        "service": "MinIO Storage",
                        "status": "WARN",
                        "message": f"MinIO not accessible: {str(e)}",
                        "where_used": "backend/services/storage_service.py",
                        "fix": "Ensure MinIO is running at MINIO_ENDPOINT. Uploads will fail without storage."
                    }
        else:
            # Check AWS S3
            access_key = os.getenv("AWS_ACCESS_KEY_ID")
            secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            
            if not access_key or not secret_key:
                result = {
                    "service": "AWS S3 Storage",
                    "status": "WARN",
                    "message": "AWS credentials not set (optional)",
                    "where_used": "backend/services/storage_service.py",
                    "fix": "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME for S3 uploads. Or set USE_MINIO=true for local storage."
                }
            else:
                try:
                    import boto3
                    client = boto3.client('s3')
                    client.list_buckets()
                    
                    result = {
                        "service": "AWS S3 Storage",
                        "status": "PASS",
                        "message": "AWS S3 accessible",
                        "where_used": "backend/services/storage_service.py"
                    }
                except Exception as e:
                    result = {
                        "service": "AWS S3 Storage",
                        "status": "FAIL",
                        "message": f"S3 connection failed: {str(e)}",
                        "where_used": "backend/services/storage_service.py",
                        "fix": "Verify AWS credentials are valid. Check AWS_REGION and S3_BUCKET_NAME."
                    }
        
        self.results.append(result)
        return result
    
    async def check_backend_auth(self) -> Dict[str, Any]:
        """Check if backend auth endpoints are working"""
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check health endpoint
                response = await client.get(f"{backend_url}/health")
                
                if response.status_code == 200:
                    result = {
                        "service": "Backend API (Health)",
                        "status": "PASS",
                        "message": f"Backend accessible at {backend_url}",
                        "where_used": "All API endpoints"
                    }
                else:
                    result = {
                        "service": "Backend API (Health)",
                        "status": "FAIL",
                        "message": f"Backend returned {response.status_code}",
                        "where_used": "All API endpoints",
                        "fix": "Ensure backend is running: cd backend && uvicorn main:app --reload"
                    }
        except Exception as e:
            result = {
                "service": "Backend API (Health)",
                "status": "FAIL",
                "message": f"Backend not accessible: {str(e)}",
                "where_used": "All API endpoints",
                "fix": "Start backend server: cd backend && uvicorn main:app --reload"
            }
        
        self.results.append(result)
        return result
    
    async def run_all_checks(self):
        """Run all connectivity checks"""
        print("🔍 Running API Connectivity Checks...\n")
        
        # Required env vars
        self.check_env_var("DATABASE_URL", required=True)
        self.check_env_var("JWT_SECRET_KEY", required=True)
        
        # Optional env vars
        self.check_env_var("OPENAI_API_KEY", required=False)
        self.check_env_var("GITHUB_TOKEN", required=False)
        self.check_env_var("USE_MINIO", required=False)
        self.check_env_var("AWS_ACCESS_KEY_ID", required=False)
        self.check_env_var("AWS_SECRET_ACCESS_KEY", required=False)
        self.check_env_var("S3_BUCKET_NAME", required=False)
        
        # Service checks
        await self.check_database()
        await self.check_openai()
        await self.check_github()
        await self.check_storage()
        await self.check_backend_auth()
        
        return self.results
    
    def print_report(self):
        """Print formatted report"""
        print("\n" + "="*80)
        print("API CONNECTIVITY CHECK REPORT")
        print("="*80 + "\n")
        
        for result in self.results:
            status_icon = {
                "PASS": "✅",
                "FAIL": "❌",
                "WARN": "⚠️"
            }.get(result["status"], "❓")
            
            print(f"{status_icon} {result['service']}")
            print(f"   Status: {result['status']}")
            print(f"   Message: {result['message']}")
            print(f"   Used in: {result['where_used']}")
            
            if "fix" in result:
                print(f"   Fix: {result['fix']}")
            
            if result.get("required") and result["status"] != "PASS":
                print(f"   ⚠️  REQUIRED - System will not work without this!")
            
            print()
        
        # Summary
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        warned = sum(1 for r in self.results if r["status"] == "WARN")
        
        print("="*80)
        print(f"Summary: {passed} Passed, {failed} Failed, {warned} Warnings")
        print("="*80)

async def main():
    checker = ConnectivityChecker()
    await checker.run_all_checks()
    checker.print_report()
    
    # Generate markdown report
    report_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "API_CONNECTION_CHECK.md")
    with open(report_path, "w") as f:
        f.write("# API CONNECTION CHECK REPORT\n\n")
        f.write(f"**Generated:** {datetime.now().isoformat()}\n\n")
        f.write("## Results\n\n")
        
        for result in checker.results:
            status_icon = {
                "PASS": "✅",
                "FAIL": "❌",
                "WARN": "⚠️"
            }.get(result["status"], "❓")
            
            f.write(f"### {status_icon} {result['service']}\n\n")
            f.write(f"- **Status:** {result['status']}\n")
            f.write(f"- **Message:** {result['message']}\n")
            f.write(f"- **Used in:** {result['where_used']}\n")
            
            if "fix" in result:
                f.write(f"- **Fix:** {result['fix']}\n")
            
            if result.get("required"):
                f.write(f"- **Required:** Yes\n")
            
            f.write("\n")
        
        f.write("## Environment Variables Required\n\n")
        f.write("### Required\n")
        f.write("- `DATABASE_URL` - PostgreSQL connection string\n")
        f.write("- `JWT_SECRET_KEY` - Secret for JWT token signing\n\n")
        
        f.write("### Optional (for enhanced features)\n")
        f.write("- `OPENAI_API_KEY` - For AI-powered matching (fallback available)\n")
        f.write("- `GITHUB_TOKEN` - For GitHub profile analysis\n")
        f.write("- `USE_MINIO=true` - For local storage (or use AWS S3)\n")
        f.write("- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` - MinIO config\n")
        f.write("- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` - AWS S3 config\n")
        f.write("- `S3_BUCKET_NAME` - Storage bucket name\n\n")
    
    print(f"\n📄 Full report saved to: {report_path}")

if __name__ == "__main__":
    asyncio.run(main())

