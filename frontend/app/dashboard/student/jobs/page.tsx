"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ExternalLink,
  Download,
  Eye,
  Building2,
  GraduationCap,
  Target,
  Award,
  AlertCircle,
  TrendingUp,
  FileText,
  Mail
} from "lucide-react"
import Link from "next/link"

// Mock job data
const jobsData = [
  {
    id: 1,
    company: "Microsoft",
    logo: "/logos/microsoft.png",
    position: "Software Development Engineer",
    location: "Hyderabad, India",
    salary: "₹18-25 LPA",
    type: "Full-time",
    deadline: "2024-02-15",
    postedDate: "2024-01-20",
    eligibility: {
      isEligible: true,
      minCGPA: 7.0,
      allowedBranches: ["Computer Engineering", "IT", "Electronics"],
      maxBacklogs: 0
    },
    description: "Join Microsoft as a Software Development Engineer and work on cutting-edge cloud technologies...",
    requirements: [
      "Strong programming skills in C++, Java, or Python",
      "Understanding of data structures and algorithms",
      "Experience with cloud technologies preferred",
      "Excellent problem-solving skills"
    ],
    roadmapStatus: {
      aptitude: { status: "completed", date: "2024-01-25" },
      technical: { status: "in_progress", date: "2024-02-01" },
      hr: { status: "pending", date: null }
    },
    appliedStudents: 145,
    shortlistedStudents: {
      aptitude: 45,
      technical: 12,
      hr: 0
    }
  },
  {
    id: 2,
    company: "Google",
    logo: "/logos/google.png",
    position: "Software Engineer Intern",
    location: "Bangalore, India",
    salary: "₹80,000/month",
    type: "Internship",
    deadline: "2024-02-20",
    postedDate: "2024-01-22",
    eligibility: {
      isEligible: false,
      minCGPA: 8.5,
      allowedBranches: ["Computer Engineering", "IT"],
      maxBacklogs: 0,
      reason: "CGPA requirement not met (Required: 8.5, Your CGPA: 8.2)"
    },
    description: "Summer internship opportunity at Google to work on innovative projects...",
    requirements: [
      "Pursuing Bachelor's/Master's in Computer Science",
      "Strong coding skills in multiple languages",
      "Previous internship experience preferred",
      "Open source contributions are a plus"
    ],
    roadmapStatus: {
      aptitude: { status: "pending", date: null },
      technical: { status: "pending", date: null },
      hr: { status: "pending", date: null }
    },
    appliedStudents: 89,
    shortlistedStudents: {
      aptitude: 0,
      technical: 0,
      hr: 0
    }
  },
  {
    id: 3,
    company: "Amazon",
    logo: "/logos/amazon.png",
    position: "SDE-1",
    location: "Chennai, India",
    salary: "₹15-20 LPA",
    type: "Full-time",
    deadline: "2024-02-18",
    postedDate: "2024-01-18",
    eligibility: {
      isEligible: true,
      minCGPA: 7.5,
      allowedBranches: ["Computer Engineering", "IT", "Electronics", "Mechanical"],
      maxBacklogs: 1
    },
    description: "Join Amazon's engineering team and build scalable systems that serve millions of customers...",
    requirements: [
      "Bachelor's degree in Engineering",
      "Proficiency in at least one programming language",
      "Understanding of system design principles",
      "Strong analytical and problem-solving skills"
    ],
    roadmapStatus: {
      aptitude: { status: "completed", date: "2024-01-28" },
      technical: { status: "completed", date: "2024-02-05" },
      hr: { status: "completed", date: "2024-02-10" }
    },
    appliedStudents: 234,
    shortlistedStudents: {
      aptitude: 78,
      technical: 25,
      hr: 8
    }
  }
]

// Mock student data for eligibility check
const studentData = {
  cgpa: 8.2,
  branch: "Computer Engineering",
  backlogs: 0,
  year: "Final Year"
}

function EligibilityTag({ job }: { job: any }) {
  if (job.eligibility.isEligible) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 gap-1">
        <CheckCircle className="w-3 h-3" />
        Eligible
      </Badge>
    )
  } else {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        Not Eligible
      </Badge>
    )
  }
}

function RecruitmentRoadmap({ job }: { job: any }) {
  const stages = [
    { key: 'aptitude', label: 'Aptitude Test', icon: FileText },
    { key: 'technical', label: 'Technical Round', icon: Target },
    { key: 'hr', label: 'HR Interview', icon: Users }
  ]

  const getStageStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-300 font-bold'
      case 'pending':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300 italic'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300'
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="w-4 h-4" />
          View Roadmap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {job.company} - Recruitment Roadmap
          </DialogTitle>
          <DialogDescription>
            Track the recruitment process stages for {job.position}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-4">
            {stages.map((stage) => {
              const stageData = job.roadmapStatus[stage.key]
              const Icon = stage.icon
              
              return (
                <Card key={stage.key} className={`border-2 ${getStageStyle(stageData.status)}`}>
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">{stage.label}</h4>
                    <p className="text-xs mt-1 capitalize">{stageData.status.replace('_', ' ')}</p>
                    {stageData.date && (
                      <p className="text-xs mt-1">{new Date(stageData.date).toLocaleDateString()}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Shortlisted Students */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shortlisted Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {job.shortlistedStudents.aptitude}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">After Aptitude</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {job.shortlistedStudents.technical}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">After Technical</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {job.shortlistedStudents.hr}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">After HR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Links */}
          <div className="space-y-3">
            {stages.map((stage) => {
              const stageData = job.roadmapStatus[stage.key]
              const shortlisted = job.shortlistedStudents[stage.key]
              
              return (
                <div key={stage.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <stage.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">{stage.label} Results</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {shortlisted} students shortlisted
                      </p>
                    </div>
                  </div>
                  {stageData.status === 'completed' && shortlisted > 0 && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download List
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function JobCard({ job }: { job: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleApply = async () => {
    if (!job.eligibility.isEligible) {
      alert("You are not eligible for this position.")
      return
    }

    setIsApplying(true)
    // Mock API call
    setTimeout(() => {
      setIsApplying(false)
      alert("Application submitted successfully!")
    }, 1500)
  }

  const daysLeft = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
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
                <Badge variant="outline">{job.type}</Badge>
              </div>
            </div>
          </div>
          <EligibilityTag job={job} />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Deadline</p>
            <p className="font-medium text-sm">{daysLeft} days left</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Applied</p>
            <p className="font-medium text-sm">{job.appliedStudents}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Min CGPA</p>
            <p className="font-medium text-sm">{job.eligibility.minCGPA}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Posted</p>
            <p className="font-medium text-sm">{new Date(job.postedDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Eligibility Alert */}
        {!job.eligibility.isEligible && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Not Eligible:</strong> {job.eligibility.reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Button
            onClick={handleApply}
            disabled={!job.eligibility.isEligible || isApplying}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {isExpanded ? "Hide Details" : "View Details"}
          </Button>
          
          <RecruitmentRoadmap job={job} />
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Job Description</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {job.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Min CGPA:</span>
                  <p className="font-medium">{job.eligibility.minCGPA}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Max Backlogs:</span>
                  <p className="font-medium">{job.eligibility.maxBacklogs}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Allowed Branches:</span>
                  <p className="font-medium">{job.eligibility.allowedBranches.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JobList({ jobs }: { jobs: any[] }) {
  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

export default function JobPostingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterEligibility, setFilterEligibility] = useState("all")

  const filteredJobs = jobsData.filter((job) => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || job.type.toLowerCase() === filterType.toLowerCase()
    
    const matchesEligibility = filterEligibility === "all" ||
                              (filterEligibility === "eligible" && job.eligibility.isEligible) ||
                              (filterEligibility === "not-eligible" && !job.eligibility.isEligible)
    
    return matchesSearch && matchesType && matchesEligibility
  })

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/student">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Job Postings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and apply to available job opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by company or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterEligibility} onValueChange={setFilterEligibility}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Eligibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="eligible">Eligible Only</SelectItem>
                    <SelectItem value="not-eligible">Not Eligible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobsData.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobsData.filter(job => job.eligibility.isEligible).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Eligible Jobs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applied</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Offers</p>
              </CardContent>
            </Card>
          </div>

          {/* Job List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Positions ({filteredJobs.length})
              </h2>
            </div>
            
            {filteredJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search criteria or filters
                </p>
              </Card>
            ) : (
              <JobList jobs={filteredJobs} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}