import asyncio
import json
import os
from typing import Dict, Any, Optional
from datetime import datetime

class SimpleMCPClient:
    """Simplified MCP client that works with our custom MCP server"""
    
    def __init__(self):
        self.server_path = os.path.join("..", "mcp_server", "simple_mcp_server.py")
        self._initialized = False
        self._server = None
    
    async def initialize(self):
        """Initialize MCP client connection"""
        if not self._initialized:
            try:
                # Import the simple MCP server
                import sys
                sys.path.append('..')
                from mcp_server.simple_mcp_server import mcp_server
                self._server = mcp_server
                self._initialized = True
            except Exception as e:
                print(f"Failed to initialize MCP client: {e}")
                self._initialized = False
    
    async def find_job_matches(self, job_id: int, min_score: float = 0.3, max_results: int = 10) -> Dict[str, Any]:
        """Find AI-powered job matches"""
        await self.initialize()
        
        if not self._server:
            return {"error": "MCP server not available"}
        
        try:
            result = await self._server.call_tool("find_semantic_matches", {
                "job_id": job_id,
                "min_score": min_score,
                "max_results": max_results
            })
            
            # Parse JSON from MCP response format
            return self._parse_mcp_response(result)
            
        except Exception as e:
            return {"error": f"MCP call failed: {str(e)}"}
    
    async def generate_tailored_resume(self, student_id: int, job_id: int) -> Dict[str, Any]:
        """Generate AI-tailored resume"""
        await self.initialize()
        
        if not self._server:
            return {"error": "MCP server not available"}
        
        try:
            result = await self._server.call_tool("generate_ai_resume", {
                "student_id": student_id,
                "job_id": job_id,
                "format": "text"
            })
            
            # Parse JSON from MCP response format
            return self._parse_mcp_response(result)
            
        except Exception as e:
            return {"error": f"Resume generation failed: {str(e)}"}
    
    async def analyze_student_progress(self, student_id: int, analysis_type: str = "progress") -> Dict[str, Any]:
        """Analyze student progress using AI"""
        await self.initialize()
        
        if not self._server:
            return {"error": "MCP server not available"}
        
        try:
            result = await self._server.call_tool("analyze_student_progress", {
                "student_id": student_id,
                "analysis_type": analysis_type
            })
            
            # Parse JSON from MCP response format
            return self._parse_mcp_response(result)
            
        except Exception as e:
            return {"error": f"Progress analysis failed: {str(e)}"}
    
    async def batch_process_new_job(self, job_id: int) -> Dict[str, Any]:
        """Batch process a new job posting"""
        await self.initialize()
        
        if not self._server:
            return {"error": "MCP server not available"}
        
        try:
            result = await self._server.call_tool("batch_process_job", {
                "job_id": job_id,
                "auto_notify": True
            })
            
            # Parse JSON from MCP response format
            return self._parse_mcp_response(result)
            
        except Exception as e:
            return {"error": f"Batch processing failed: {str(e)}"}
    
    def _parse_mcp_response(self, mcp_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse MCP tool response format to extract JSON data
        
        MCP response format:
        {
            "content": [
                {
                    "type": "text",
                    "text": "{...json string...}"
                }
            ]
        }
        """
        try:
            # Extract text content from MCP response
            if isinstance(mcp_response, dict):
                content = mcp_response.get("content", [])
                if content and isinstance(content, list) and len(content) > 0:
                    text_content = content[0].get("text", "")
                    if text_content:
                        # Parse JSON string to dict
                        return json.loads(text_content)
                # If no content array, try direct access
                if "error" in mcp_response:
                    return mcp_response
                # If it's already a dict (not wrapped), return as-is
                return mcp_response
            
            # If response is already a dict, return as-is
            return mcp_response if isinstance(mcp_response, dict) else {"error": "Invalid response format"}
            
        except json.JSONDecodeError as e:
            return {"error": f"Failed to parse MCP response JSON: {str(e)}", "raw_response": str(mcp_response)}
        except Exception as e:
            return {"error": f"Failed to parse MCP response: {str(e)}", "raw_response": str(mcp_response)}

# Global MCP client instance
simple_mcp_client = SimpleMCPClient()
