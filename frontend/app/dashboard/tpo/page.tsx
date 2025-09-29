"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  ExternalLink
} from "lucide-react"

// Mock TPO data
const tpoData = {
  name: "Mr. Rajesh Kumar",
  email: "rajesh.kumar@university.edu",
  department: "Training & Placement Office",
  phone: "+91 98765 43210",
  office: "TPO Office, Admin Building"
}

// Mock job postings data
const jobPostings = [
  {
    id: 1,
    company: "Microsoft",
    position: "Software Development Engineer",
    location: "Hyderabad, India",
    salary: "₹18-25 LPA",
    type: "Full-time",
    deadline: "2024-02-15",
    postedDate: "2024-01-20",
    status: "active",
    appliedStudents: 145,
    eligibility: {
      minCGPA: 7.0,
      allowedBranches: ["Computer Engineering", "IT", "Electronics"],
      maxBacklogs: 0
    },
    roadmapStatus: {
      aptitude: { status: "completed", date: "2024-01-25", shortlisted: 45 },
      technical: { status: "in_progress", date: "2024-02-01", shortlisted: 12 },
      hr: { status: "pending", date: null, shortlisted: 0 }
    }
  },
  {
    id: 2,
    company: "Google",
    position: "Software Engineer Intern",
    location: "Bangalore, India",
    salary: "₹80,000/month",
    type: "Internship",
    deadline: "2024-02-20",
    postedDate: "2024-01-22",
    status: "active",
    appliedStudents: 89,
    eligibility: {
      minCGPA: 8.5,
      allowedBranches: ["Computer Engineering", "IT"],
      maxBacklogs: 0
    },
    roadmapStatus: {
      aptitude: { status: "pending", date: null, shortlisted: 0 },
      technical: { status: "pending", date: null, shortlisted: 0 },
      hr: { status: "pending", date: null, shortlisted: 0 }
    }
  },
  {
    id: 3,
    company: "Amazon",
    position: "SDE-1",
    location: "Chennai, India",
    salary: "₹15-20 LPA",
    type: "Full-time",
    deadline: "2024-02-18",
    postedDate: "2024-01-18",
    status: "completed",
    appliedStudents: 234,
    eligibility: {
      minCGPA: 7.5,
      allowedBranches: ["Computer Engineering", "IT", "Electronics", "Mechanical"],
      maxBacklogs: 1
    },
    roadmapStatus: {
      aptitude: { status: "completed", date: "2024-01-28", shortlisted: 78 },
      technical: { status: "completed", date: "2024-02-05", shortlisted: 25 },
      hr: { status: "completed", date: "2024-02-10", shortlisted: 8 }
    }
  }
]

function TpoHeader() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <User className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {tpoData.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{tpoData.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{tpoData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{tpoData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{tpoData.office}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JobPostingForm() {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    type: "",
    deadline: "",
    minCGPA: "",
    maxBacklogs: "",
    allowedBranches: [],
    contactEmail: "",
    contactPhone: "",
    companyWebsite: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Job posting created successfully!")
      // Reset form
      setFormData({
        company: "",
        position: "",
        description: "",
        requirements: "",
        location: "",
        salary: "",
        type: "",
        deadline: "",
        minCGPA: "",
        maxBacklogs: "",
        allowedBranches: [],
        contactEmail: "",
        contactPhone: "",
        companyWebsite: ""
      })
    }, 1500)
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company & Position Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position Title</Label>
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
            <Label htmlFor="description">Job Description</Label>
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
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the job requirements (one per line)"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                placeholder="e.g., ₹15-20 LPA"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
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
              required
            />
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Eligibility Criteria</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minCGPA">Minimum CGPA</Label>
                <Input
                  id="minCGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="e.g., 7.0"
                  value={formData.minCGPA}
                  onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxBacklogs">Maximum Backlogs</Label>
                <Input
                  id="maxBacklogs"
                  type="number"
                  min="0"
                  placeholder="e.g., 0"
                  value={formData.maxBacklogs}
                  onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed Branches</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Computer Engineering", "Information Technology", "Electronics Engineering", "Mechanical Engineering"].map((branch) => (
                  <label key={branch} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allowedBranches.includes(branch)}
                      onChange={(e) => handleBranchChange(branch, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{branch}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  placeholder="https://company.com"
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {isSubmitting ? "Creating Job Posting..." : "Create Job Posting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function StudentDataUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      alert("Please select a file to upload")
      return
    }

    setIsUploading(true)
    
    // Mock API call
    setTimeout(() => {
      setIsUploading(false)
      alert("Student data uploaded successfully!")
      setUploadedFile(null)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Student Data Upload
        </CardTitle>
        <CardDescription>
          Upload student database in Excel format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please ensure the Excel file contains columns: Name, SAP ID, Email, Branch, CGPA, Backlogs, Year, Phone
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop your Excel file here
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              or click to browse files
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
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
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Student Data"}
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">892</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Eligible Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">Last Updated</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JobManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateRoadmapStatus = (jobId: number, stage: string, status: string) => {
    // Mock function to update roadmap status
    alert(`Updated ${stage} status to ${status} for job ${jobId}`)
  }

  const uploadShortlist = (jobId: number, stage: string) => {
    // Mock function to upload shortlist
    alert(`Upload shortlist for ${stage} stage of job ${jobId}`)
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
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {job.position}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.status === 'active' ? 'default' : job.status === 'completed' ? 'secondary' : 'outline'}>
                        {job.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Applied</p>
                      <p className="font-medium text-sm">{job.appliedStudents}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <Target className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Aptitude</p>
                      <p className="font-medium text-sm">{job.roadmapStatus.aptitude.shortlisted}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Technical</p>
                      <p className="font-medium text-sm">{job.roadmapStatus.technical.shortlisted}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Final</p>
                      <p className="font-medium text-sm">{job.roadmapStatus.hr.shortlisted}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Recruitment Stages</h4>
                    
                    {Object.entries(job.roadmapStatus).map(([stage, data]) => (
                      <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            data.status === 'completed' ? 'bg-green-500' :
                            data.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-medium capitalize">{stage.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {data.status.replace('_', ' ')}
                              {data.date && ` - ${new Date(data.date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={data.status}
                            onValueChange={(value) => updateRoadmapStatus(job.id, stage, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {data.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => uploadShortlist(job.id, stage)}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload List
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TpoDashboard() {
  // Mock user data for TPO role
  const mockUser = {
    id: "3",
    name: "Mr. Rajesh Kumar",
    email: "tpo@example.com",
    role: "tpo" as const,
    department: "Training & Placement Office"
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <TpoHeader />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobPostings.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobPostings.reduce((sum, job) => sum + job.appliedStudents, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobPostings.filter(job => job.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobPostings.reduce((sum, job) => sum + job.roadmapStatus.hr.shortlisted, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Final Selections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Placement Rate</p>
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
              <JobManagementDashboard />
            </TabsContent>

            <TabsContent value="post-job">
              <JobPostingForm />
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