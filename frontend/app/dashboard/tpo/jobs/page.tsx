"use client"

import { useMemo, useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, Building2, Calendar, CheckCircle, Edit, Eye, Filter, MapPin, Plus, Search, Trash2 } from "lucide-react"

const mockUser = {
  id: "3",
  name: "Mr. Rajesh Kumar",
  email: "tpo@example.com",
  role: "tpo" as const,
  department: "Training & Placement Office",
}

const initialJobs = [
  {
    id: 101,
    company: "Microsoft",
    position: "Software Development Engineer",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹18–25 LPA",
    deadline: "2024-12-15",
    status: "active" as const,
    postedDate: "2024-11-20",
    applied: 145,
    shortlisted: 45,
  },
  {
    id: 102,
    company: "Google",
    position: "Software Engineer Intern",
    location: "Bangalore, India",
    type: "Internship",
    salary: "₹80,000/month",
    deadline: "2024-12-20",
    status: "active" as const,
    postedDate: "2024-11-22",
    applied: 89,
    shortlisted: 22,
  },
  {
    id: 103,
    company: "Amazon",
    position: "SDE-1",
    location: "Chennai, India",
    type: "Full-time",
    salary: "₹15–20 LPA",
    deadline: "2024-12-18",
    status: "closed" as const,
    postedDate: "2024-11-18",
    applied: 234,
    shortlisted: 33,
  },
]

export default function TpoJobsPage() {
  const [jobs, setJobs] = useState(initialJobs)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return jobs.filter((j) =>
      (statusFilter === "all" || j.status === statusFilter) &&
      (typeFilter === "all" || j.type === typeFilter) &&
      ([j.company, j.position, j.location].join(" ").toLowerCase().includes(query.toLowerCase()))
    )
  }, [jobs, statusFilter, typeFilter, query])

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create, manage, and track campus hiring drives</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input placeholder="Enter company name" defaultValue="Microsoft" />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input placeholder="e.g. SDE-1" defaultValue="Software Development Engineer" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Location</Label>
                    <Input placeholder="City, Country" defaultValue="Hyderabad, India" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select defaultValue="Full-time">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input placeholder="e.g. ₹18–25 LPA" defaultValue="₹18–25 LPA" />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Input type="date" defaultValue="2024-12-15" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Publish</Button>
                </div>
                <Alert className="mt-3">
                  <AlertDescription>Hardcoded demo: Publishing will not persist, but the interface simulates a real workflow.</AlertDescription>
                </Alert>
              </DialogContent>
            </Dialog>
          </div>

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
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
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
                      <TableCell>{job.position}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</div></TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{job.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{job.deadline}</div>
                      </TableCell>
                      <TableCell className="text-right">{job.applied}</TableCell>
                      <TableCell className="text-right">{job.shortlisted}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" />View</Button>
                          <Button variant="outline" size="sm" className="gap-1"><Edit className="w-4 h-4" />Edit</Button>
                          <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="w-4 h-4" />Close</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.filter(j => j.status === "active").length}</p>
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
                <Badge className="mx-auto">Demo Interface</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Hardcoded data for realistic feel</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}