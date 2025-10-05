"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Upload, FileText, CheckCircle, AlertCircle, Info, User as UserIcon, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, ClipboardList, Tag } from "lucide-react"

interface ScanResult {
  overall_score: number
  breakdown: Record<string, number>
  matched_keywords: string[]
  missing_required: string[]
  missing_preferred: string[]
  suggestions: string[]
}

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
  const [jobDescription, setJobDescription] = useState<string>("")
  const [resumeText, setResumeText] = useState<string>("")
  const [useTextMode, setUseTextMode] = useState<boolean>(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setFileName(selected ? selected.name : "")
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      if (!jobDescription.trim()) {
        throw new Error("Please paste the Job Description to analyze against.")
      }

      if (useTextMode) {
        if (!resumeText.trim()) {
          throw new Error("Please paste your resume text or switch to file upload.")
        }
        const { data } = await api.ats.scan({
          resume_text: resumeText,
          job_description: jobDescription,
        })
        setResult(data as ScanResult)
      } else {
        if (!file) {
          throw new Error("Please upload a resume file or switch to text mode.")
        }
        const formData = new FormData()
        formData.append("job_description", jobDescription)
        formData.append("resume_file", file, file.name)
        const { data } = await api.ats.scanUpload(formData)
        setResult(data as ScanResult)
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || "Analysis failed"
      setError(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">ATS Scanner</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload your resume or paste text to get an ATS compatibility score and suggestions based on a Job Description.</p>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the JD for the role you’re targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[140px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resume Input</CardTitle>
                  <CardDescription>Supported formats: PDF, DOCX. Or paste plain text.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={useTextMode ? "secondary" : "outline"}
                    onClick={() => setUseTextMode(!useTextMode)}
                  >
                    {useTextMode ? "Switch to File Upload" : "Switch to Text Mode"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {useTextMode ? (
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="min-h-[160px]"
                />
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} className="max-w-sm"/>
                  {fileName && (
                    <Badge variant="secondary" className="truncate max-w-[240px]">{fileName}</Badge>
                  )}
                </div>
              )}

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
                          <p className="text-xl font-bold text-gray-900 dark:text-white">ATS Score: {result.overall_score}/100</p>
                          <div className="grid sm:grid-cols-2 gap-3 mt-2">
                            {Object.entries(result.breakdown).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 capitalize">{k.replace('_', ' ')}</span>
                                <Badge variant="secondary">{v}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Matched Keywords</CardTitle>
                      <CardDescription>Detected matches between your resume and JD</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.matched_keywords.length ? (
                        <div className="flex flex-wrap gap-2">
                          {result.matched_keywords.map((kw, idx) => (
                            <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">{kw}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No direct keyword matches found.</p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Missing Required</CardTitle>
                        <CardDescription>Consider adding or emphasizing these</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.missing_required.length ? (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {result.missing_required.map((kw, idx) => (
                              <li key={idx} className="text-gray-700 dark:text-gray-300">{kw}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">All required keywords are covered.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Missing Preferred</CardTitle>
                        <CardDescription>Nice-to-have keywords to boost ATS score</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.missing_preferred.length ? (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {result.missing_preferred.map((kw, idx) => (
                              <li key={idx} className="text-gray-700 dark:text-gray-300">{kw}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">No preferred keywords missing.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Suggestions</CardTitle>
                      <CardDescription>Actionable tips based on gaps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.suggestions.length ? (
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          {result.suggestions.map((rec, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">{rec}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No suggestions at this time.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}