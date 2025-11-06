"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, Building2, Calendar, CheckCircle, Edit, Eye, Filter, MapPin, Plus, Search, Trash2, Loader2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Job {
  id: number
  company: string
  title: string
  location: string | null
  job_type: string
  salary_range: string | null
  deadline: string | null
  is_active: boolean
  created_at: string
  requirements: string[]
}

export default function TpoJobsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  // Create job dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    company: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    job_type: "full-time",
    deadline: "",
  })

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.jobs.list(true) // Include inactive for TPO
        const jobsData = response.data.map((job: any) => ({
          id: job.id,
          company: job.company,
          title: job.title,
          location: job.location,
          job_type: job.job_type || "full-time",
          salary_range: job.salary_range,
          deadline: job.deadline,
          is_active: job.is_active,
          created_at: job.created_at,
          requirements: job.requirements || [],
          // Calculate application count (would need separate endpoint for accurate count)
          applied: 0, // Placeholder - would need applications count endpoint
          shortlisted: 0, // Placeholder
        }))
        setJobs(jobsData)
      } catch (err: any) {
        console.error('Failed to load jobs:', err)
        setError(err.response?.data?.detail || "Failed to load jobs")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadJobs()
  }, [])

  // Handle create job
  const handleCreateJob = async () => {
    if (!createFormData.company || !createFormData.title || !createFormData.description) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      // Parse requirements from textarea (one per line)
      const requirements = createFormData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)

      const jobData = {
        company: createFormData.company,
        title: createFormData.title,
        description: createFormData.description,
        requirements: requirements,
        location: createFormData.location || null,
        salary_range: createFormData.salary_range || null,
        job_type: createFormData.job_type,
        deadline: createFormData.deadline || null,
      }

      await api.jobs.create(jobData)
      
      // Reset form and close dialog
      setCreateFormData({
        company: "",
        title: "",
        description: "",
        requirements: "",
        location: "",
        salary_range: "",
        job_type: "full-time",
        deadline: "",
      })
      setIsCreateDialogOpen(false)
      
      // Reload jobs
      const response = await api.jobs.list(true)
      const jobsData = response.data.map((job: any) => ({
        id: job.id,
        company: job.company,
        title: job.title,
        location: job.location,
        job_type: job.job_type || "full-time",
        salary_range: job.salary_range,
        deadline: job.deadline,
        is_active: job.is_active,
        created_at: job.created_at,
        requirements: job.requirements || [],
        applied: 0,
        shortlisted: 0,
      }))
      setJobs(jobsData)
    } catch (err: any) {
      console.error('Failed to create job:', err)
      setError(err.response?.data?.detail || "Failed to create job")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle close job (set inactive)
  const handleCloseJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to close this job posting?")) {
      return
    }

    try {
      await api.jobs.updateStatus(jobId, false)
      // Reload jobs
      const response = await api.jobs.list(true)
      const jobsData = response.data.map((job: any) => ({
        id: job.id,
        company: job.company,
        title: job.title,
        location: job.location,
        job_type: job.job_type || "full-time",
        salary_range: job.salary_range,
        deadline: job.deadline,
        is_active: job.is_active,
        created_at: job.created_at,
        requirements: job.requirements || [],
        applied: 0,
        shortlisted: 0,
      }))
      setJobs(jobsData)
    } catch (err: any) {
      console.error('Failed to close job:', err)
      alert(err.response?.data?.detail || "Failed to close job")
    }
  }

  // Handle delete job
  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return
    }

    try {
      await api.jobs.delete(jobId)
      // Reload jobs
      const response = await api.jobs.list(true)
      const jobsData = response.data.map((job: any) => ({
        id: job.id,
        company: job.company,
        title: job.title,
        location: job.location,
        job_type: job.job_type || "full-time",
        salary_range: job.salary_range,
        deadline: job.deadline,
        is_active: job.is_active,
        created_at: job.created_at,
        requirements: job.requirements || [],
        applied: 0,
        shortlisted: 0,
      }))
      setJobs(jobsData)
    } catch (err: any) {
      console.error('Failed to delete job:', err)
      alert(err.response?.data?.detail || "Failed to delete job")
    }
  }

  // Handle view job
  const handleViewJob = (jobId: number) => {
    router.push(`/dashboard/tpo/jobs/${jobId}`)
  }

  // Handle edit job (open dialog with job data)
  const handleEditJob = (job: Job) => {
    // For now, navigate to a detail page or open edit dialog
    // TODO: Implement edit dialog
    router.push(`/dashboard/tpo/jobs/${job.id}/edit`)
  }

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && j.is_active) || 
        (statusFilter === "closed" && !j.is_active)
      const matchesType = typeFilter === "all" || j.job_type === typeFilter
      const matchesSearch = [j.company, j.title, j.location || ''].join(" ").toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesType && matchesSearch
    })
  }, [jobs, statusFilter, typeFilter, query])

  const displayUser = user ? {
    id: user.id?.toString() || "3",
    name: user.profile_data?.first_name && user.profile_data?.last_name
      ? `${user.profile_data.first_name} ${user.profile_data.last_name}`
      : user.email?.split('@')[0] || "TPO",
    email: user.email || "",
    role: "tpo" as const
  } : {
    id: "3",
    name: "TPO",
    email: "",
    role: "tpo" as const
  }

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create, manage, and track campus hiring drives</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Input 
                      placeholder="Enter company name" 
                      value={createFormData.company}
                      onChange={(e) => setCreateFormData({ ...createFormData, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input 
                      placeholder="e.g. SDE-1" 
                      value={createFormData.title}
                      onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description *</Label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Describe the role and responsibilities"
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Requirements (one per line) *</Label>
                    <textarea
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                      placeholder="Python&#10;React&#10;Node.js"
                      value={createFormData.requirements}
                      onChange={(e) => setCreateFormData({ ...createFormData, requirements: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Location</Label>
                    <Input 
                      placeholder="City, Country" 
                      value={createFormData.location}
                      onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={createFormData.job_type} 
                      onValueChange={(value) => setCreateFormData({ ...createFormData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input 
                      placeholder="e.g. ₹18–25 LPA" 
                      value={createFormData.salary_range}
                      onChange={(e) => setCreateFormData({ ...createFormData, salary_range: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Input 
                      type="date" 
                      value={createFormData.deadline}
                      onChange={(e) => setCreateFormData({ ...createFormData, deadline: e.target.value })}
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateJob} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, location" className="pl-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full gap-2"><Filter className="w-4 h-4" />Advanced Filters</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Campus Drives</CardTitle>
              <CardDescription>Track applications and shortlist progress</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading jobs...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs found. {query || statusFilter !== "all" || typeFilter !== "all" ? "Try adjusting your filters." : "Create your first job posting."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Applied</TableHead>
                      <TableHead className="text-right">Shortlisted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(job => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2"><Building2 className="w-4 h-4" />{job.company}</div>
                        </TableCell>
                        <TableCell>{job.title}</TableCell>
                        <TableCell><div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location || "N/A"}</div></TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{job.job_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{job.applied || 0}</TableCell>
                        <TableCell className="text-right">{job.shortlisted || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewJob(job.id)}>
                              <Eye className="w-4 h-4" />View
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEditJob(job)}>
                              <Edit className="w-4 h-4" />Edit
                            </Button>
                            {job.is_active ? (
                              <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleCloseJob(job.id)}>
                                <Trash2 className="w-4 h-4" />Close
                              </Button>
                            ) : (
                              <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDeleteJob(job.id)}>
                                <Trash2 className="w-4 h-4" />Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.filter(j => j.is_active).length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Drives</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Posted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.filter(j => !j.is_active).length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
