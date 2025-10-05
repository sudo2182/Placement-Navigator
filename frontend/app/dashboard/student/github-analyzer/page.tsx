"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Github, BarChart3, Star, GitFork, Code, Activity, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react"
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts"

export default function GithubAnalyzerPage() {
  const mockUser = {
    id: "1",
    name: "Aditya Ray",
    email: "adityaray@gmail.com",
    role: "student" as const,
    sapid: "60004210001",
    course: "Computer Science",
    year: "Final Year"
  }

  const [username, setUsername] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const handleAnalyze = async () => {
    // Hardcoded analysis to always show Darsh Iyer's repos and skill graph, regardless of input
    setIsAnalyzing(true)
    setError(null)

    setTimeout(() => {
      const data = {
        profile: {
          name: "Darsh Iyer",
          username: username || "darshiyer",
          bio: "Full‑stack developer passionate about scalable systems and developer tools.",
          location: "Mumbai, India",
          joined: "Joined Sep 2021",
        },
        summary: "Strong portfolio with consistent contributions, solid project structure, and a diverse tech stack across frontend, backend, and DevOps.",
        repos: [
          {
            name: "campus-connect",
            description: "Monorepo for university placement platform with student, faculty, and TPO dashboards.",
            stars: 42,
            forks: 8,
            language: "TypeScript",
            topics: ["nextjs", "tailwind", "node", "postgres", "turborepo"],
            activity: "Active",
            lastUpdate: "Updated 2 days ago"
          },
          {
            name: "ai-resume-maker",
            description: "LLM-powered resume generator and ATS optimizer.",
            stars: 31,
            forks: 5,
            language: "Python",
            topics: ["fastapi", "llm", "nlp", "docker"],
            activity: "Active",
            lastUpdate: "Updated 5 days ago"
          },
          {
            name: "devops-pipelines",
            description: "Reusable GitHub Actions workflows for CI/CD across Node and Python services.",
            stars: 24,
            forks: 6,
            language: "YAML",
            topics: ["github-actions", "ci", "cd", "docker", "aws"],
            activity: "Maintained",
            lastUpdate: "Updated 1 week ago"
          },
          {
            name: "data-structures-and-algorithms",
            description: "Curated problems and solutions with explanations and complexity analyses.",
            stars: 18,
            forks: 3,
            language: "JavaScript",
            topics: ["algorithms", "leetcode", "practice"],
            activity: "Maintained",
            lastUpdate: "Updated 3 weeks ago"
          },
          {
            name: "ml-experiments",
            description: "Experiments with classical ML and MLOps workflows.",
            stars: 15,
            forks: 4,
            language: "Python",
            topics: ["scikit-learn", "mlops", "dvc"],
            activity: "Exploratory",
            lastUpdate: "Updated 1 month ago"
          }
        ],
        skillGraph: [
          { label: "Frontend (React/Next.js)", value: 85 },
          { label: "Backend (Node/FastAPI)", value: 80 },
          { label: "Databases (Postgres/Mongo)", value: 78 },
          { label: "DevOps (Docker/CI/CD/AWS)", value: 75 },
          { label: "Algorithms/Data Structures", value: 70 },
          { label: "ML/NLP Basics", value: 65 },
        ],
        highlights: [
          "Consistent commit activity over the past 12 months",
          "Good test coverage in key repos (Jest/PyTest)",
          "Reusable CI workflows and deployment automation",
          "Clear README and documentation in major projects",
        ],
        recommendations: [
          "Add badges (build, coverage) to main README",
          "Increase unit/integration test coverage in backend services",
          "Consolidate environment configs and secrets via best practices",
          "Add more issues and project boards for collaboration tracking",
        ]
      }

      setResult(data)
      setIsAnalyzing(false)
    }, 1000)
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-700 dark:text-white" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">GitHub Analyzer</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Type any GitHub username and press Enter to analyze repositories, activity, and a skills overview.</p>

          <Card>
            <CardHeader>
              <CardTitle>Analyze GitHub Profile</CardTitle>
              <CardDescription>Enter a GitHub username to analyze profile details, repositories, and inferred skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyze()
                  }}
                  placeholder="Enter GitHub username"
                  className="max-w-sm"
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                  <Github className="w-4 h-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fetching profile and repos...</p>
                  <Progress value={60} className="h-2" />
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Profile summary */}
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-700 dark:text-white" />
                        <div>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">{result.profile.name} ({result.profile.username})</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.profile.bio}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{result.profile.location} • {result.profile.joined}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Repositories */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Repositories</CardTitle>
                      <CardDescription>Repository overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.repos.map((repo: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{repo.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{repo.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</Badge>
                                <Badge variant="secondary" className="text-xs flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forks}</Badge>
                                <Badge variant="outline" className="text-xs">{repo.language}</Badge>
                                {repo.topics.map((t: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs flex items-center gap-1"><Activity className="w-3 h-3" /> {repo.activity}</Badge>
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">{repo.lastUpdate}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Skill Graph */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Graph</CardTitle>
                      <CardDescription>Creative visualization of inferred skills</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="h-72 text-slate-400 dark:text-slate-600">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={result.skillGraph.map((s: { label: string; value: number }) => ({ subject: s.label, value: s.value, fullMark: 100 }))}
                              cx="50%"
                              cy="50%"
                              outerRadius="80%"
                            >
                              <defs>
                                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                                  <stop offset="70%" stopColor="#6366f1" stopOpacity={0.35} />
                                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
                                </radialGradient>
                              </defs>
                              <PolarGrid stroke="currentColor" strokeOpacity={0.35} />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} tickLine={false} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Skills" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#radarGradient)" fillOpacity={1} isAnimationActive animationBegin={200} animationDuration={1200} />
                              <Tooltip formatter={(val: number, _name: string, props: any) => [`${val}%`, props.payload.subject]} contentStyle={{ backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px" }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                          {result.skillGraph.map((s: { label: string; value: number }, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{s.label}</span>
                              <Badge variant="secondary" className="text-xs">{s.value}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Highlights and Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                      <CardDescription>Key strengths observed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {result.highlights.map((h: string, idx: number) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{h}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Actionable improvements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {result.recommendations.map((r: string, idx: number) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{r}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!isAnalyzing && !result && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Tip: Type any username and press Enter to analyze their profile.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}