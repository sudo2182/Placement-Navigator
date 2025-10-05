"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Github, Brain, Sparkles, BarChart3 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function JobFitPage() {
  const mockUser = {
    id: "1",
    name: "Aditya Ray",
    email: "adityaray@gmail.com",
    role: "student" as const,
    sapid: "60004210001",
    course: "Computer Science",
    year: "Final Year"
  }

  const [jd, setJd] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openTailor, setOpenTailor] = useState(false)
  const [openPlan, setOpenPlan] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["Deep Learning Classifier", "Campus Connect"])
  const [atsCovered, setAtsCovered] = useState<string[]>(["Python", "CI/CD", "Docker", "SQL", "GitHub Actions"]) 
  const [atsMissing, setAtsMissing] = useState<string[]>(["TensorFlow", "PyTorch", "MLflow", "AWS"]) 

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)

    // Simulate realistic backend processing with delay
    setTimeout(() => {
      const summary = {
        role: "Machine Learning Engineer",
        company: jd?.length > 0 ? "(from JD)" : "Tech Company",
        extractedSkills: [
          "Python", "TensorFlow", "PyTorch", "Scikit-learn", "Data Pipelines", "Feature Engineering",
          "Model Deployment", "Docker", "CI/CD", "AWS", "SQL", "Experiment Tracking"
        ],
        requirements: [
          "Design, train, and evaluate ML models for production",
          "Build scalable data pipelines for feature extraction",
          "Deploy models via containerization and CI/CD",
          "Collaborate with product to define metrics and success criteria",
          "Maintain model versioning and experiment tracking",
        ]
      }

      const adityaProfile = {
        name: "Aditya Ray",
        resumeHighlights: [
          "Built a Next.js + FastAPI platform; implemented placement analytics",
          "Developed ML experiments with scikit-learn; deployed via Docker",
          "Set up CI/CD workflows on GitHub Actions for Node/Python",
          "Strong GitHub activity with multiple repos and documentation",
        ],
        githubSignals: {
          repos: 24,
          monthlyCommits: 36,
          topRepos: ["campus-connect", "ml-experiments", "ai-resume-maker"],
          qualityIndicators: ["Tests present", "CI configured", "README badges"],
        },
        skills: [
          { label: "Python", level: 82 },
          { label: "ML Basics (sklearn)", level: 74 },
          { label: "Deep Learning (TF/PyTorch)", level: 58 },
          { label: "Data Engineering", level: 65 },
          { label: "Docker & CI/CD", level: 80 },
          { label: "AWS", level: 60 },
          { label: "SQL", level: 70 },
        ]
      }

      // Hardcoded similarity scoring results (as if computed via cosine similarity)
      const matched = [
        { skill: "Python", evidence: "Projects and ML experiments in repo; frequent commits", weight: 0.25 },
        { skill: "Docker & CI/CD", evidence: "Reusable CI workflows; Dockerized services", weight: 0.2 },
        { skill: "SQL", evidence: "Used Postgres across projects; queries visible", weight: 0.1 },
        { skill: "ML Basics (sklearn)", evidence: "Classical ML pipelines in ml-experiments", weight: 0.15 },
      ]
      const missing = [
        { skill: "Deep Learning (TensorFlow/PyTorch)", action: "Implement CNN/RNN models on a classification task; add training scripts", impact: "+12%" },
        { skill: "AWS MLOps (SageMaker/ECR)", action: "Deploy a model with SageMaker and container registry; document workflow", impact: "+8%" },
        { skill: "Experiment Tracking (MLflow)", action: "Integrate MLflow for metrics, params; show versioning", impact: "+6%" },
      ]

      const fitScore = 78 // out of 100, realistic mid-high fit

      const recommendations = [
        {
          title: "Add Deep Learning Project",
          detail: "Build a PyTorch image classifier with clear metrics and training logs.",
          githubSuggestion: "Create repo deep-learning-classifier; add README badges and CI.",
        },
        {
          title: "Integrate MLflow",
          detail: "Track experiments and versions; add dashboard screenshots.",
          githubSuggestion: "Add MLflow config and artifacts in ml-experiments repo.",
        },
        {
          title: "Deploy with AWS",
          detail: "Use SageMaker/ECR; demonstrate production-grade deployment steps.",
          githubSuggestion: "Add deploy/ folder with IaC snippets and workflows.",
        }
      ]

      setResult({ summary, adityaProfile, matched, missing, fitScore, recommendations })
      setIsAnalyzing(false)
    }, 1200)
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700 dark:text-white" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Job Fit Analyzer</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Paste a job description and we’ll estimate your fit against your profile, highlight gaps, and recommend GitHub upgrades.</p>

          <Card>
            <CardHeader>
              <CardTitle>Analyze Job Description</CardTitle>
              <CardDescription>Hardcoded demo: compares Aditya Ray’s profile to a Machine Learning Engineer JD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description here..."
                className="min-h-[160px]"
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                  <Brain className="w-4 h-4" />
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing JD and comparing against profile...</p>
                  <Progress value={60} className="h-2" />
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Fit Score */}
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle>Fit Score</CardTitle>
                      <CardDescription>Estimated match with JD requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={result.fitScore} className="h-3" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Score: <span className="font-semibold text-gray-900 dark:text-white">{result.fitScore}%</span> (simulated cosine similarity)</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">ML Engineer</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Matched vs Missing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Matched Skills</CardTitle>
                        <CardDescription>Evidence from resume and GitHub</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.matched.map((m: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.skill}</span>
                              <Badge variant="secondary" className="text-xs">Weight {(m.weight * 100).toFixed(0)}%</Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{m.evidence}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Missing Skills</CardTitle>
                        <CardDescription>Practical actions to close gaps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.missing.map((g: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{g.skill}</span>
                              <Badge variant="outline" className="text-xs">Impact {g.impact}</Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{g.action}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* GitHub Signals & Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>GitHub Signals</CardTitle>
                      <CardDescription>Activity and quality indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Repos</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{result.adityaProfile.githubSignals.repos}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Commits</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{result.adityaProfile.githubSignals.monthlyCommits}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Top Repos</p>
                          <div className="flex flex-wrap gap-2">
                            {result.adityaProfile.githubSignals.topRepos.map((r: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.adityaProfile.githubSignals.qualityIndicators.map((q: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{q}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Concrete next steps</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.detail}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">GitHub: {rec.githubSuggestion}</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Github className="w-4 h-4" /> Add to GitHub Plan
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CTA */}
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setOpenTailor(true)} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Tailor Resume for ML Engineer
                    </Button>
                    <Button variant="secondary" onClick={() => setOpenPlan(true)} className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      View Gap-to-Action Plan
                    </Button>
                  </div>

                  {/* Tailor Resume Dialog */}
                  <Dialog open={openTailor} onOpenChange={setOpenTailor}>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Tailor Resume for ML Engineer</DialogTitle>
                        <DialogDescription>Hardcoded preview: optimized summary, ATS keywords, and selected projects for credibility.</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="summary" className="mt-2">
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="skills">ATS Keywords</TabsTrigger>
                          <TabsTrigger value="projects">Projects</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="space-y-3 pt-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Tailored Professional Summary</CardTitle>
                              <CardDescription className="text-xs">Optimized for ML Engineer roles with highlighted keywords</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <p className="text-gray-700 dark:text-gray-300">
                                ML Engineer with hands-on experience in <Badge className="mx-1" variant="secondary">Python</Badge>,
                                classical ML (<Badge className="mx-1" variant="outline">scikit-learn</Badge>), and production workflows using
                                <Badge className="mx-1" variant="secondary">Docker</Badge> and <Badge className="mx-1" variant="secondary">CI/CD</Badge>.
                                Built experiment pipelines and dashboards; actively maintains repositories with tests and documentation.
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                Currently expanding into <Badge className="mx-1" variant="outline">TensorFlow</Badge>,
                                <Badge className="mx-1" variant="outline">PyTorch</Badge>, and experiment tracking with
                                <Badge className="mx-1" variant="outline">MLflow</Badge>; targeting deployments on
                                <Badge className="mx-1" variant="outline">AWS</Badge>.
                              </p>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-3 pt-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">ATS Keyword Coverage</CardTitle>
                              <CardDescription className="text-xs">Estimated coverage of JD keywords</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <Progress value={78} className="h-2" />
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Coverage: <span className="font-semibold">78%</span></p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold">Covered</p>
                                <div className="flex flex-wrap gap-2">
                                  {atsCovered.map((k) => (
                                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold">Missing</p>
                                <div className="flex flex-wrap gap-2">
                                  {atsMissing.map((k) => (
                                    <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="projects" className="space-y-3 pt-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Featured Projects</CardTitle>
                              <CardDescription className="text-xs">Select projects to highlight in the tailored resume</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {["Deep Learning Classifier", "Campus Connect", "ML Experiments"].map((p) => (
                                <div key={p} className="flex items-center gap-3">
                                  <Checkbox
                                    checked={selectedProjects.includes(p)}
                                    onCheckedChange={(checked) => {
                                      setSelectedProjects((prev) => {
                                        if (checked) return Array.from(new Set([...prev, p]))
                                        return prev.filter((x) => x !== p)
                                      })
                                    }}
                                  />
                                  <Label className="text-sm">{p}</Label>
                                </div>
                              ))}
                              <Separator className="my-2" />
                              <p className="text-xs text-gray-600 dark:text-gray-400">These selections will be emphasized in the final resume export.</p>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>

                      <DialogFooter>
                        <Button onClick={() => setOpenTailor(false)} className="gap-2">
                          <Sparkles className="w-4 h-4" /> Apply Tailoring
                        </Button>
                        <Button variant="outline" onClick={() => setOpenTailor(false)}>Cancel</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Gap-to-Action Plan Sheet */}
                  <Sheet open={openPlan} onOpenChange={setOpenPlan}>
                    <SheetContent side="right" className="sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Gap-to-Action Plan</SheetTitle>
                        <SheetDescription>Two-week plan with checkpoints to boost your Fit Score.</SheetDescription>
                      </SheetHeader>

                      <div className="mt-4 space-y-5">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Week 1</CardTitle>
                            <CardDescription className="text-xs">Deep learning + experiment tracking</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Checkbox checked className="" />
                              <Label className="text-sm">Implement PyTorch classifier with training logs</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Checkbox />
                              <Label className="text-sm">Integrate MLflow for metrics/params</Label>
                            </div>
                            <Progress value={45} className="h-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Progress: 45%</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Week 2</CardTitle>
                            <CardDescription className="text-xs">Deployment + documentation polish</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Checkbox />
                              <Label className="text-sm">Deploy to AWS (SageMaker/ECR), add CI</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Checkbox checked />
                              <Label className="text-sm">Update README with badges and usage</Label>
                            </div>
                            <Progress value={30} className="h-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Progress: 30%</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Expected Impact</CardTitle>
                            <CardDescription className="text-xs">Projected Fit Score increase</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs">Deep Learning</p>
                              <Badge variant="secondary" className="text-xs">+12%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs">AWS Deployment</p>
                              <Badge variant="secondary" className="text-xs">+8%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs">MLflow Tracking</p>
                              <Badge variant="secondary" className="text-xs">+6%</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <SheetFooter className="mt-4">
                        <Button className="gap-2" onClick={() => setOpenPlan(false)}>
                          <BarChart3 className="w-4 h-4" /> Mark as Started
                        </Button>
                        <Button variant="outline" onClick={() => setOpenPlan(false)}>Export Plan</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet
                  >
                </div>
              )}

              {!isAnalyzing && !result && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Tip: Paste any JD and click Analyze to simulate backend comparison.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}