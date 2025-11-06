"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Briefcase, 
  Upload, 
  Users, 
  Plus, 
  Building2, 
  DollarSign, 
  MapPin, 
  Calendar, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  Target, 
  User, 
  Mail, 
  Phone, 
  Globe,
  AlertCircle,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Job {
  id: number
  company: string
  title: string
  description: string
  location: string | null
  salary_range: string | null
  job_type: string
  deadline: string | null
  is_active: boolean
  created_at: string
  requirements: string[]
  application_count?: number
}

function TpoHeader() {
  const { user } = useAuthStore()
  const tpoData = user || {
    name: "TPO User",
    email: "tpo@example.com",
    department: "Training & Placement Office",
    phone: "+91 98765 43210",
    office: "TPO Office, Admin Building"
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <User className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {tpoData.name || tpoData.email}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{tpoData.department || "Training & Placement Office"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{tpoData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JobPostingForm({ onJobCreated }: { onJobCreated: () => void }) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    type: "full-time",
    deadline: "",
    minCGPA: "",
    maxBacklogs: "",
    allowedBranches: [] as string[],
    contactEmail: "",
    contactPhone: "",
    companyWebsite: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Parse requirements
      const requirements = formData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)

      const jobData = {
        company: formData.company,
        title: formData.position,
        description: formData.description,
        requirements: requirements,
        location: formData.location || null,
        salary_range: formData.salary || null,
        job_type: formData.type,
        deadline: formData.deadline || null,
      }

      await api.jobs.create(jobData)
      
      // Reset form
      setFormData({
        company: "",
        position: "",
        description: "",
        requirements: "",
        location: "",
        salary: "",
        type: "full-time",
        deadline: "",
        minCGPA: "",
        maxBacklogs: "",
        allowedBranches: [],
        contactEmail: "",
        contactPhone: "",
        companyWebsite: ""
      })
      
      // Refresh job list
      onJobCreated()
    } catch (err: any) {
      console.error('Failed to create job:', err)
      setError(err.response?.data?.detail || "Failed to create job posting")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        allowedBranches: [...formData.allowedBranches, branch]
      })
    } else {
      setFormData({
        ...formData,
        allowedBranches: formData.allowedBranches.filter(b => b !== branch)
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Job Posting
        </CardTitle>
        <CardDescription>
          Add a new job opportunity for students
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position Title *</Label>
              <Input
                id="position"
                placeholder="Enter position title"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role and responsibilities"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements * (one per line)</Label>
            <Textarea
              id="requirements"
              placeholder="Python&#10;React&#10;Node.js"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                placeholder="e.g., ₹15-20 LPA"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Job Posting...
              </>
            ) : (
              "Create Job Posting"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function StudentDataUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)
    
    try {
      // TODO: Create bulk upload endpoint
      // For now, show error that endpoint doesn't exist yet
      setError("Bulk upload endpoint not yet implemented. Please use individual student registration.")
      // When implemented:
      // const formData = new FormData()
      // formData.append('file', uploadedFile)
      // await api.profiles.bulkUpload(formData)
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.response?.data?.detail || "Failed to upload student data")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    // Generate CSV template
    const headers = "sapid,name,branch,email,cgpa,backlogs,year,phone,city,skills,internships,linkedin,github,portfolio,resume,placement_status,graduation_year\n"
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_data_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Student Data Upload
        </CardTitle>
        <CardDescription>
          Upload student database in Excel/CSV format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please ensure the file contains columns: Name, SAP ID, Email, Branch, CGPA, Backlogs, Year, Phone
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop your CSV/Excel file here
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              or click to browse files
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer mt-4" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        </div>

        {uploadedFile && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setUploadedFile(null)}
                variant="ghost"
                size="sm"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={handleUpload} disabled={!uploadedFile || isUploading} className="flex-1 gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Student Data
              </>
            )}
          </Button>
          
          <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function JobManagementDashboard({ jobs, onRefresh }: { jobs: Job[], onRefresh: () => void }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && job.is_active) ||
      (statusFilter === "completed" && !job.is_active)
    return matchesSearch && matchesStatus
  })

  const handleViewJob = (jobId: number) => {
    router.push(`/dashboard/tpo/jobs/${jobId}`)
  }

  const handleEditJob = (jobId: number) => {
    router.push(`/dashboard/tpo/jobs/${jobId}/edit`)
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return
    }

    try {
      await api.jobs.delete(jobId)
      onRefresh()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete job")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Management Dashboard
          </CardTitle>
          <CardDescription>
            Manage all job postings and recruitment processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found. {searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first job posting."}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                          {job.company}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                          {job.salary_range && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={job.is_active ? 'default' : 'secondary'}>
                          {job.is_active ? 'Active' : 'Closed'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Applied</p>
                        <p className="font-medium text-sm">{job.application_count || 0}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Job Type</p>
                        <p className="font-medium text-sm capitalize">{job.job_type}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Requirements</p>
                        <p className="font-medium text-sm">{job.requirements?.length || 0}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-medium text-sm capitalize">{job.is_active ? 'Active' : 'Closed'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewJob(job.id)}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditJob(job.id)}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TpoDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.jobs.list(true) // Include inactive for TPO
      const jobsData = response.data.map((job: any) => ({
        id: job.id,
        company: job.company,
        title: job.title,
        description: job.description,
        location: job.location,
        job_type: job.job_type || "full-time",
        salary_range: job.salary_range,
        deadline: job.deadline,
        is_active: job.is_active,
        created_at: job.created_at,
        requirements: job.requirements || [],
        application_count: job.application_count || 0,
      }))
      setJobs(jobsData)
    } catch (err: any) {
      console.error('Failed to load jobs:', err)
      setError(err.response?.data?.detail || "Failed to load jobs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const displayUser = user ? {
    id: user.id?.toString() || "3",
    name: user.profile_data?.first_name && user.profile_data?.last_name
      ? `${user.profile_data.first_name} ${user.profile_data.last_name}`
      : user.email?.split('@')[0] || "TPO",
    email: user.email || "",
    role: "tpo" as const,
    department: user.profile_data?.department || "Training & Placement Office"
  } : {
    id: "3",
    name: "TPO",
    email: "",
    role: "tpo" as const,
    department: "Training & Placement Office"
  }

  // Calculate stats from real data
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(j => j.is_active).length
  const totalApplications = jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <TpoHeader />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalJobs}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalJobs - activeJobs}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0}%
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="job-management" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="job-management" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Job Management
              </TabsTrigger>
              <TabsTrigger value="post-job" className="gap-2">
                <Plus className="w-4 h-4" />
                Post New Job
              </TabsTrigger>
              <TabsTrigger value="student-data" className="gap-2">
                <Upload className="w-4 h-4" />
                Student Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="job-management">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading jobs...</span>
                </div>
              ) : (
                <JobManagementDashboard jobs={jobs} onRefresh={loadJobs} />
              )}
            </TabsContent>

            <TabsContent value="post-job">
              <JobPostingForm onJobCreated={loadJobs} />
            </TabsContent>

            <TabsContent value="student-data">
              <StudentDataUpload />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
