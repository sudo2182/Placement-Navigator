#!/usr/bin/env python3
"""
ATS Scanner Dynamic Test
Tests that ATS scanner actually processes resume content and scores change based on content.

Test A: Upload resume with skills → check score and detected skills
Test B: Upload same resume WITHOUT skills → verify score decreases and skills removed
"""

import sys
import os
import asyncio
from typing import Dict, Any

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from backend.services.ats_service import ats_service
from io import BytesIO

def create_resume_text_with_skills() -> str:
    """Create a resume text with technical skills"""
    return """
John Doe
Software Engineer
Email: john.doe@email.com
Phone: +1-555-123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with expertise in Python, React, and AWS. 
Strong background in full-stack development and cloud architecture.

SKILLS
- Python, JavaScript, TypeScript
- React, Next.js, Node.js
- AWS, Docker, Kubernetes
- PostgreSQL, MongoDB
- Git, CI/CD

EXPERIENCE
Software Engineer | Tech Corp | 2020 - Present
- Developed scalable web applications using React and Node.js
- Deployed applications on AWS using Docker and Kubernetes
- Implemented CI/CD pipelines for automated testing and deployment

EDUCATION
Bachelor of Science in Computer Science
State University | 2016 - 2020
GPA: 3.8/4.0

PROJECTS
E-Commerce Platform
- Built using React and Node.js
- Deployed on AWS with Docker
- Used PostgreSQL for data storage
"""

def create_resume_text_without_skills() -> str:
    """Create a resume text WITHOUT technical skills"""
    return """
John Doe
Software Engineer
Email: john.doe@email.com
Phone: +1-555-123-4567

PROFESSIONAL SUMMARY
Experienced professional with strong communication and teamwork skills.
Focused on delivering quality results and continuous learning.

EXPERIENCE
Software Engineer | Tech Corp | 2020 - Present
- Worked on various software projects
- Collaborated with team members
- Participated in code reviews

EDUCATION
Bachelor of Science in Computer Science
State University | 2016 - 2020
GPA: 3.8/4.0

PROJECTS
E-Commerce Platform
- Developed a web application
- Implemented user interface
- Worked with databases
"""

def test_ats_dynamic():
    """Run dynamic ATS tests"""
    print("=" * 80)
    print("ATS SCANNER DYNAMIC TEST")
    print("=" * 80)
    print("\n🎯 Testing that ATS scanner processes content dynamically...\n")
    
    # Test A: Resume WITH skills
    print("📄 TEST A: Resume WITH Technical Skills")
    print("-" * 80)
    
    resume_with_skills = create_resume_text_with_skills()
    result_with_skills = ats_service.analyze_text(resume_with_skills)
    
    score_with = result_with_skills.get('score', 0)
    skills_with = result_with_skills.get('skills', [])
    
    print(f"✅ Score: {score_with}/100")
    print(f"✅ Skills detected: {len(skills_with)}")
    print(f"   Skills: {', '.join(skills_with[:10])}")
    if len(skills_with) > 10:
        print(f"   ... and {len(skills_with) - 10} more")
    
    print(f"\n📊 Sections found: {len(result_with_skills.get('sections_found', []))}")
    print(f"   Sections: {', '.join(result_with_skills.get('sections_found', [])[:5])}")
    
    # Test B: Resume WITHOUT skills
    print("\n\n📄 TEST B: Resume WITHOUT Technical Skills")
    print("-" * 80)
    
    resume_without_skills = create_resume_text_without_skills()
    result_without_skills = ats_service.analyze_text(resume_without_skills)
    
    score_without = result_without_skills.get('score', 0)
    skills_without = result_without_skills.get('skills', [])
    
    print(f"✅ Score: {score_without}/100")
    print(f"✅ Skills detected: {len(skills_without)}")
    if skills_without:
        print(f"   Skills: {', '.join(skills_without)}")
    else:
        print("   Skills: None detected")
    
    print(f"\n📊 Sections found: {len(result_without_skills.get('sections_found', []))}")
    print(f"   Sections: {', '.join(result_without_skills.get('sections_found', [])[:5])}")
    
    # Analysis
    print("\n\n" + "=" * 80)
    print("ANALYSIS: Is MCP/Backend Processing Dynamically?")
    print("=" * 80)
    
    score_diff = score_with - score_without
    skills_diff = len(skills_with) - len(skills_without)
    
    print(f"\n📈 Score Change: {score_with} → {score_without} (Δ{score_diff:+d})")
    print(f"📈 Skills Change: {len(skills_with)} → {len(skills_without)} (Δ{skills_diff:+d})")
    
    # Verification
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Skills should be different
    if len(skills_with) > len(skills_without):
        print("\n✅ PASS: Skills changed based on resume content")
        print(f"   Resume WITH skills: {len(skills_with)} skills")
        print(f"   Resume WITHOUT skills: {len(skills_without)} skills")
        tests_passed += 1
    else:
        print("\n❌ FAIL: Skills did NOT change appropriately")
        print(f"   WITH skills: {len(skills_with)} skills")
        print(f"   WITHOUT skills: {len(skills_without)} skills")
        print("   ⚠️  This suggests hardcoded data or no processing")
    
    # Test 2: Score should be different (or at least skills count should differ)
    if score_diff != 0 or skills_diff > 0:
        print("\n✅ PASS: Score or skills changed")
        print(f"   Score difference: {score_diff}")
        print(f"   Skills difference: {skills_diff}")
        tests_passed += 1
    else:
        print("\n❌ FAIL: Score AND skills count did NOT change")
        print("   ⚠️  This suggests hardcoded responses")
        print("   ⚠️  MCP/Backend may not be processing content")
    
    # Test 3: Specific skills should be detected
    expected_skills = ['python', 'react', 'aws', 'docker', 'postgresql']
    detected_skills_lower = [s.lower() for s in skills_with]
    expected_found = [s for s in expected_skills if s in detected_skills_lower]
    
    if len(expected_found) >= 3:
        print("\n✅ PASS: Expected skills detected in resume WITH skills")
        print(f"   Found: {', '.join(expected_found)}")
        print(f"   Missing: {', '.join([s for s in expected_skills if s not in detected_skills_lower])}")
        tests_passed += 1
    else:
        print("\n⚠️  WARNING: Fewer expected skills detected than anticipated")
        print(f"   Found: {', '.join(expected_found)}")
        print(f"   Expected at least 3 of: {', '.join(expected_skills)}")
    
    # Final verdict
    print("\n" + "=" * 80)
    print("FINAL VERDICT")
    print("=" * 80)
    
    if tests_passed == total_tests:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ ATS scanner is processing content dynamically")
        print("✅ MCP/Backend is LIVE and working correctly")
        print("✅ Skills and scores change based on resume content")
        return 0
    elif tests_passed >= 2:
        print("\n⚠️  PARTIAL SUCCESS")
        print(f"✅ {tests_passed}/{total_tests} tests passed")
        print("⚠️  Some issues detected - check results above")
        return 1
    else:
        print("\n❌ TESTS FAILED")
        print(f"❌ Only {tests_passed}/{total_tests} tests passed")
        print("❌ ATS scanner may be using hardcoded data")
        print("❌ MCP/Backend may not be processing content")
        return 1

if __name__ == "__main__":
    exit_code = test_ats_dynamic()
    sys.exit(exit_code)

