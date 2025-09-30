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
import { Calendar } from "@/components/ui/calendar"
import { 
  BookOpen, 
  GraduationCap, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Link as LinkIcon,
  FileText,
  Video,
  ExternalLink,
  CheckCircle,
  User,
  MapPin,
  CalendarDays,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Award,
  Target,
  Building2,
  Mail,
  Phone,
  Globe
} from "lucide-react"

// Mock faculty data
const facultyData = {
  name: "Dr. Priya Sharma",
  email: "priya.sharma@university.edu",
  department: "Computer Engineering",
  phone: "+91 98765 43210",
  office: "Room 301, IT Building",
  specialization: ["Data Structures", "Algorithms", "System Design"],
  experience: "12 years"
}

// Mock posted resources
const postedResources = [
  {
    id: 1,
    title: "Data Structures and Algorithms Complete Guide",
    type: "document",
    url: "https://example.com/dsa-guide",
    targetDepartment: "Computer Engineering",
    postedDate: "2024-01-15",
    views: 1250,
    downloads: 340
  },
  {
    id: 2,
    title: "System Design Interview Preparation",
    type: "video",
    url: "https://youtube.com/playlist?list=example",
    targetDepartment: "All Departments",
    postedDate: "2024-01-20",
    views: 890,
    downloads: 0
  }
]

// Mock scheduled courses
const scheduledCourses = [
  {
    id: 1,
    title: "Advanced React Development Bootcamp",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    time: "10:00 AM - 4:00 PM",
    location: "Lab 301, IT Building",
    maxStudents: 30,
    registeredStudents: 18,
    status: "open"
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    startDate: "2024-02-22",
    endDate: "2024-02-24",
    time: "2:00 PM - 6:00 PM",
    location: "Computer Lab 2",
    maxStudents: 25,
    registeredStudents: 25,
    status: "full"
  }
]

function FacultyHeader() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {facultyData.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{facultyData.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{facultyData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{facultyData.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{facultyData.experience} experience</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    url: "",
    targetDepartment: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Resource posted successfully!")
      setFormData({
        title: "",
        description: "",
        type: "",
        url: "",
        targetDepartment: ""
      })
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Post New Resource
        </CardTitle>
        <CardDescription>
          Share study materials, links, and resources with students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resource Title</Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document/PDF</SelectItem>
                  <SelectItem value="video">Video/Playlist</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the resource and its benefits"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Resource URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/resource"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Target Department</Label>
            <Select value={formData.targetDepartment} onValueChange={(value) => setFormData({ ...formData, targetDepartment: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="computer">Computer Engineering</SelectItem>
                <SelectItem value="it">Information Technology</SelectItem>
                <SelectItem value="electronics">Electronics Engineering</SelectItem>
                <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {isSubmitting ? "Posting Resource..." : "Post Resource"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CourseSchedulerForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    time: "",
    location: "",
    maxStudents: "",
    prerequisites: "",
    syllabus: ""
  })
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDates.length === 0) {
      alert("Please select course dates")
      return
    }
    
    setIsSubmitting(true)
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Course scheduled successfully!")
      setFormData({
        title: "",
        description: "",
        duration: "",
        time: "",
        location: "",
        maxStudents: "",
        prerequisites: "",
        syllabus: ""
      })
      setSelectedDates([])
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Schedule Crash Course
        </CardTitle>
        <CardDescription>
          Create and schedule intensive learning sessions for students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="2-days">2 Days</SelectItem>
                  <SelectItem value="3-days">3 Days</SelectItem>
                  <SelectItem value="5-days">5 Days (1 Week)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Course Description</Label>
            <Textarea
              id="course-description"
              placeholder="Describe the course content and objectives"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                placeholder="e.g., 10:00 AM - 4:00 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lab 301, IT Building"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-students">Max Students</Label>
              <Input
                id="max-students"
                type="number"
                placeholder="e.g., 30"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Course Dates</Label>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                className="rounded-md"
              />
              {selectedDates.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Selected Dates:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date, index) => (
                      <Badge key={index} variant="secondary">
                        {date.toLocaleDateString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              placeholder="List the prerequisites (one per line)"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syllabus">Course Syllabus</Label>
            <Textarea
              id="syllabus"
              placeholder="Outline the course curriculum (one topic per line)"
              value={formData.syllabus}
              onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <CalendarIcon className="w-4 h-4" />
            {isSubmitting ? "Scheduling Course..." : "Schedule Course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function RegisteredStudentsModal({ course }: { course: any }) {
  // Mock registered students data
  const registeredStudents = [
    { id: 1, name: "Rahul Sharma", sapid: "60004210001", email: "rahul.sharma@student.edu", branch: "Computer Engineering" },
    { id: 2, name: "Priya Patel", sapid: "60004210002", email: "priya.patel@student.edu", branch: "Information Technology" },
    { id: 3, name: "Amit Kumar", sapid: "60004210003", email: "amit.kumar@student.edu", branch: "Computer Engineering" }
  ]

  const exportStudentList = () => {
    // Mock export functionality
    alert("Student list exported successfully!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          View Students ({course.registeredStudents})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registered Students - {course.title}</DialogTitle>
          <DialogDescription>
            Students who have registered for this crash course
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {registeredStudents.length} students registered
            </p>
            <Button onClick={exportStudentList} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export List
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">SAP ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Branch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {registeredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.sapid}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResourcesOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Posted Resources ({postedResources.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {postedResources.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    {resource.type === 'video' ? (
                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{resource.targetDepartment}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Views:</span>
                  <p className="font-medium">{resource.views}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                  <p className="font-medium">{new Date(resource.postedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CoursesOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Scheduled Courses ({scheduledCourses.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scheduledCourses.map((course) => (
          <Card key={course.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{course.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(course.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.time}
                    </span>
                  </div>
                </div>
                <Badge variant={course.status === 'open' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                  <span className="font-medium ml-1">
                    {course.registeredStudents}/{course.maxStudents}
                  </span>
                </div>
                <RegisteredStudentsModal course={course} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function FacultyDashboard() {
  // Mock user data for faculty role
  const mockUser = {
    id: "2",
    name: "Dr. Priya Sharma",
    email: "faculty@example.com",
    role: "faculty" as const,
    department: "Computer Engineering"
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <FacultyHeader />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{postedResources.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resources Posted</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledCourses.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Courses Scheduled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduledCourses.reduce((sum, course) => sum + course.registeredStudents, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {postedResources.reduce((sum, resource) => sum + resource.views, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="post-resource" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="post-resource" className="gap-2">
                <Plus className="w-4 h-4" />
                Post Resource
              </TabsTrigger>
              <TabsTrigger value="schedule-course" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Schedule Course
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <BookOpen className="w-4 h-4" />
                My Resources
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                My Courses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="post-resource">
              <ResourceForm />
            </TabsContent>

            <TabsContent value="schedule-course">
              <CourseSchedulerForm />
            </TabsContent>

            <TabsContent value="resources">
              <ResourcesOverview />
            </TabsContent>

            <TabsContent value="courses">
              <CoursesOverview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}