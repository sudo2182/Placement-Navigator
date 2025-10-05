from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import httpx
import os
from datetime import datetime, timedelta
import asyncio

router = APIRouter(prefix="/github", tags=["github"])

# GitHub API configuration
GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

async def fetch_github_data(username: str) -> Dict[str, Any]:
    """Fetch user data from GitHub API"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=500, detail="GitHub token not configured")
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Career-Navigator/1.0"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Fetch user profile
            user_response = await client.get(f"{GITHUB_API_BASE}/users/{username}", headers=headers)
            if user_response.status_code == 404:
                raise HTTPException(status_code=404, detail="GitHub user not found")
            elif user_response.status_code != 200:
                raise HTTPException(status_code=user_response.status_code, detail="GitHub API error")
            
            user_data = user_response.json()
            
            # Fetch user repositories
            repos_response = await client.get(f"{GITHUB_API_BASE}/users/{username}/repos", headers=headers)
            repos_data = repos_response.json() if repos_response.status_code == 200 else []
            
            # Fetch user events for activity analysis
            events_response = await client.get(f"{GITHUB_API_BASE}/users/{username}/events/public", headers=headers)
            events_data = events_response.json() if events_response.status_code == 200 else []
            
            return {
                "user": user_data,
                "repos": repos_data,
                "events": events_data
            }
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="GitHub API timeout")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"GitHub API request failed: {str(e)}")

def analyze_github_profile(user_data: Dict, repos_data: List[Dict], events_data: List[Dict]) -> Dict[str, Any]:
    """Analyze GitHub profile data and generate insights"""
    
    # Calculate activity metrics
    now = datetime.now()
    last_month = now - timedelta(days=30)
    
    recent_commits = 0
    recent_repos = set()
    
    for event in events_data:
        event_date = datetime.strptime(event["created_at"], "%Y-%m-%dT%H:%M:%SZ")
        if event_date >= last_month:
            recent_commits += 1
            if "repo" in event:
                recent_repos.add(event["repo"]["name"])
    
    # Analyze repositories
    total_stars = sum(repo.get("stargazers_count", 0) for repo in repos_data)
    total_forks = sum(repo.get("forks_count", 0) for repo in repos_data)
    
    # Get language distribution
    languages = {}
    for repo in repos_data:
        if repo.get("language"):
            languages[repo["language"]] = languages.get(repo["language"], 0) + 1
    
    # Sort repos by stars
    sorted_repos = sorted(repos_data, key=lambda x: x.get("stargazers_count", 0), reverse=True)
    
    # Generate skill insights
    skill_categories = {
        "Frontend": ["JavaScript", "TypeScript", "React", "Vue", "Angular", "HTML", "CSS"],
        "Backend": ["Python", "Java", "Node.js", "Go", "Rust", "PHP", "Ruby"],
        "Mobile": ["Swift", "Kotlin", "React Native", "Flutter", "Dart"],
        "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform"],
        "Data": ["Python", "R", "SQL", "Pandas", "NumPy", "TensorFlow", "PyTorch"]
    }
    
    detected_skills = []
    for category, skills in skill_categories.items():
        for skill in skills:
            if any(skill.lower() in repo.get("name", "").lower() or 
                   skill.lower() in repo.get("description", "").lower() or
                   skill.lower() in str(repo.get("topics", [])).lower()
                   for repo in repos_data):
                detected_skills.append({"category": category, "skill": skill})
    
    # Generate summary
    summary_parts = []
    if recent_commits > 0:
        summary_parts.append(f"Active developer with {recent_commits} recent contributions")
    if total_stars > 0:
        summary_parts.append(f"Strong portfolio with {total_stars} total stars")
    if len(repos_data) > 10:
        summary_parts.append(f"Experienced with {len(repos_data)} repositories")
    
    summary = ". ".join(summary_parts) + "." if summary_parts else "GitHub profile shows development activity."
    
    return {
        "profile": {
            "name": user_data.get("name", user_data.get("login", "")),
            "username": user_data.get("login", ""),
            "bio": user_data.get("bio", ""),
            "location": user_data.get("location", ""),
            "joined": f"Joined {datetime.strptime(user_data.get('created_at', ''), '%Y-%m-%dT%H:%M:%SZ').strftime('%b %Y')}",
            "followers": user_data.get("followers", 0),
            "following": user_data.get("following", 0),
            "public_repos": user_data.get("public_repos", 0)
        },
        "summary": summary,
        "metrics": {
            "total_stars": total_stars,
            "total_forks": total_forks,
            "recent_commits": recent_commits,
            "recent_repos": len(recent_repos),
            "languages": dict(sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5])
        },
        "repos": [
            {
                "name": repo.get("name", ""),
                "description": repo.get("description", ""),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "language": repo.get("language", ""),
                "topics": repo.get("topics", []),
                "activity": "Active" if repo.get("updated_at") and 
                           datetime.strptime(repo["updated_at"], "%Y-%m-%dT%H:%M:%SZ") > last_month else "Maintained",
                "lastUpdate": f"Updated {datetime.strptime(repo.get('updated_at', ''), '%Y-%m-%dT%H:%M:%SZ').strftime('%b %d, %Y')}"
            }
            for repo in sorted_repos[:10]  # Top 10 repos
        ],
        "skills": detected_skills,
        "activity": {
            "recent_commits": recent_commits,
            "recent_repos": list(recent_repos),
            "contribution_streak": "Active" if recent_commits > 0 else "Inactive"
        }
    }

@router.get("/analyze/{username}")
async def analyze_github_user(username: str) -> Dict[str, Any]:
    """Analyze a GitHub user's profile and repositories"""
    try:
        # Fetch data from GitHub API
        github_data = await fetch_github_data(username)
        
        # Analyze the data
        analysis = analyze_github_profile(
            github_data["user"],
            github_data["repos"],
            github_data["events"]
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/health")
async def github_health():
    """Check if GitHub API is accessible"""
    if not GITHUB_TOKEN:
        return {"status": "error", "message": "GitHub token not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/user",
                headers={"Authorization": f"token {GITHUB_TOKEN}"}
            )
            if response.status_code == 200:
                return {"status": "ok", "message": "GitHub API accessible"}
            else:
                return {"status": "error", "message": f"GitHub API error: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": f"GitHub API not accessible: {str(e)}"}
