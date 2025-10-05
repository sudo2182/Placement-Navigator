"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Info, User as UserIcon, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, ClipboardList, Tag } from "lucide-react"

export default function ATSScannerPage() {
  const mockUser = {
    id: "1",
    name: "Aditya Ray",
    email: "adityaray@gmail.com",
    role: "student" as const,
    sapid: "60004210001",
    course: "Computer Science",
    year: "Final Year"
  }

  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setFileName(selected ? selected.name : "")
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    // Analysis will run regardless of whether a file is selected, per requirement to hardcode output
    setIsAnalyzing(true)
    setError(null)

    setTimeout(() => {
      const mockScore = 85
      setResult({
        score: mockScore,
        summary: "Resume is ATS-friendly with clear sectioning, relevant keywords, and consistent formatting. Strong technical stack and projects aligned to target roles.",
        recommendations: [
          "Tailor summary to the specific job description for stronger keyword match",
          "Add 1–2 quantified outcomes to each experience (e.g., performance improvements, cost savings)",
          "Ensure consistent tense in bullet points (past for completed roles, present for ongoing)",
          "Keep file name professional: darsh_iyer_resume.pdf",
        ],
        improvements: [
          "Use action verbs at the start of bullet points (Led, Built, Optimized, Implemented)",
          "Group skills into categories (Frontend, Backend, DevOps, Data) for readability",
          "Add links to GitHub and portfolio where relevant (e.g., project repositories)",
          "Limit sections to concise bullet points to avoid dense paragraphs",
        ],
        extracted: {
          name: "Darsh Iyer",
          email: "darsh.iyer@example.com",
          phone: "+91 98765 43210",
          location: "Mumbai, India",
          headline: "Computer Engineering student specializing in full‑stack development and data‑driven systems.",
          skills: [
            "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
            "Python", "FastAPI", "PostgreSQL", "MongoDB", "AWS", "Docker",
            "CI/CD", "Tailwind CSS"
          ],
          education: {
            degree: "B.E. Computer Engineering",
            college: "Dwarkadas J. Sanghvi College of Engineering",
            years: "2021–2025"
          },
          experience: [
            {
              company: "TechStartup Inc.",
              role: "Software Engineering Intern",
              period: "May 2024 – Aug 2024",
              highlights: [
                "Built REST APIs with Node.js and Express for core features",
                "Implemented CI/CD pipeline reducing deployment time by 40%",
                "Collaborated with cross-functional team to ship two product releases"
              ]
            },
            {
              company: "University Capstone",
              role: "Project Lead",
              period: "Jan 2024 – May 2024",
              highlights: [
                "Led a team of 4 to design scalable microservices architecture",
                "Optimized database queries improving response time by 30%",
                "Deployed services to AWS with Docker and GitHub Actions"
              ]
            }
          ],
          projects: [
            {
              title: "Campus Connect",
              description: "End-to-end placement workflow platform with dashboards for students, faculty, and TPO.",
              stack: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"]
            },
            {
              title: "AI Resume Maker",
              description: "Generates tailored resumes using LLMs and job description parsing.",
              stack: ["Python", "FastAPI", "MongoDB", "Docker"]
            }
          ],
          certifications: [
            "AWS Cloud Practitioner (2023)",
            "Meta Front‑End Developer (2024)"
          ]
        }
      })
      setIsAnalyzing(false)
    }, 1000)
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">ATS Scanner</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload your resume to get a quick ATS compatibility score and recommendations.</p>

          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Supported formats: PDF, DOCX. Max size: 5 MB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="max-w-sm"/>
                {fileName && (
                  <Badge variant="secondary" className="truncate max-w-[240px]">{fileName}</Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                  <FileText className="w-4 h-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                </Button>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Running checks...</p>
                  <Progress value={45} className="h-2" />
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <Card className="border-amber-200 dark:border-amber-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">ATS Score: {result.score}/100</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Actionable suggestions to improve your resume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {result.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Improvements</CardTitle>
                      <CardDescription>Top areas to refine for ATS and recruiter readability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {result.improvements.map((imp: string, idx: number) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{imp}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Extracted Resume Data</CardTitle>
                      <CardDescription>Detected details for review and refinement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personal Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <UserIcon className="w-4 h-4" />
                          <span className="font-medium">{result.extracted.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="w-4 h-4" />
                          <span>{result.extracted.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Phone className="w-4 h-4" />
                          <span>{result.extracted.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4" />
                          <span>{result.extracted.location}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.extracted.headline}</p>

                      {/* Skills */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.extracted.skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <p className="font-medium">{result.extracted.education.degree}</p>
                          <p>{result.extracted.education.college} • {result.extracted.education.years}</p>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-4 h-4" /> Experience</h3>
                        <div className="space-y-3">
                          {result.extracted.experience.map((exp: { company: string; role: string; period: string; highlights: string[] }, idx: number) => (
                            <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                              <p className="font-medium">{exp.role} • {exp.company}</p>
                              <p className="text-gray-600 dark:text-gray-400">{exp.period}</p>
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                {exp.highlights.map((h: string, i: number) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Projects</h3>
                        <div className="space-y-3">
                          {result.extracted.projects.map((proj: { title: string; description: string; stack: string[] }, idx: number) => (
                            <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                              <p className="font-medium">{proj.title}</p>
                              <p className="text-gray-600 dark:text-gray-400">{proj.description}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {proj.stack.map((t: string, i: number) => (
                                  <Badge key={i} variant="outline" className="px-2 py-0.5 text-xs flex items-center gap-1"><Tag className="w-3 h-3" /> {t}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Award className="w-4 h-4" /> Certifications</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          {result.extracted.certifications.map((cert: string, idx: number) => (
                            <li key={idx}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!isAnalyzing && !result && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Tip: For best results, avoid using images or tables; stick to clean text formatting.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}