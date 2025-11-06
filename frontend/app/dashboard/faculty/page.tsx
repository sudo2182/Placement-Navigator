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
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Resource {
  id: number
  title: string
  description: string | null
  resource_type: string
  external_url: string | null
  file_path: string | null
  tags: string[]
  views: number
  downloads: number
  created_at: string
}

interface Course {
  id: number
  title: string
  description: string
  subject: string
  start_date: string
  end_date: string
  schedule: any
  max_students: number
  current_enrollments: number
  is_active: boolean
  created_at: string
}

interface CourseRegistration {
  id: number
  student_id: number
  course_id: number
  registration_date: string
  status: string
  student?: {
    name: string
    email: string
    sapid?: string
  }
}

function FacultyHeader() {
  const { user } = useAuthStore()
  const facultyData = user || {
    name: "Dr. Priya Sharma",
    email: "faculty@example.com",
    department: "Computer Engineering",
    phone: "+91 98765 43210",
    office: "Room 301, IT Building",
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {facultyData.name || facultyData.email}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{facultyData.department || "Faculty"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{facultyData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceForm({ onResourceCreated }: { onResourceCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    url: "",
    tags: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const resourceData = {
        title: formData.title,
        description: formData.description || null,
        resource_type: formData.type,
        external_url: formData.url || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        is_public: true
      }

      await api.resources.create(resourceData)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "",
        url: "",
        tags: ""
      })
      
      // Refresh resources
      onResourceCreated()
    } catch (err: any) {
      console.error('Failed to create resource:', err)
      setError(err.response?.data?.detail || "Failed to post resource")
    } finally {
      setIsSubmitting(false)
    }
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resource Title *</Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type *</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Resource URL *</Label>
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
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., DSA, Programming, Interview Prep"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting Resource...
              </>
            ) : (
              "Post Resource"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CourseSchedulerForm({ onCourseCreated }: { onCourseCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    start_date: "",
    end_date: "",
    time: "",
    location: "",
    maxStudents: "",
    prerequisites: "",
    syllabus: ""
  })
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDates.length === 0 && !formData.start_date) {
      setError("Please select course dates or provide start/end dates")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Parse dates
      let startDate = formData.start_date
      let endDate = formData.end_date
      
      if (selectedDates.length > 0) {
        const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
        startDate = sortedDates[0].toISOString().split('T')[0]
        endDate = sortedDates[sortedDates.length - 1].toISOString().split('T')[0]
      }

      // Parse syllabus
      const syllabus = formData.syllabus
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const courseData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || "General",
        start_date: startDate,
        end_date: endDate || startDate,
        schedule: {
          time: formData.time,
          location: formData.location,
          prerequisites: formData.prerequisites.split('\n').filter(p => p.trim()),
          syllabus: syllabus
        },
        max_students: parseInt(formData.maxStudents) || 50
      }

      await api.courses.create(courseData)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        subject: "",
        start_date: "",
        end_date: "",
        time: "",
        location: "",
        maxStudents: "",
        prerequisites: "",
        syllabus: ""
      })
      setSelectedDates([])
      
      // Refresh courses
      onCourseCreated()
    } catch (err: any) {
      console.error('Failed to create course:', err)
      setError(err.response?.data?.detail || "Failed to schedule course")
    } finally {
      setIsSubmitting(false)
    }
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title *</Label>
              <Input
                id="course-title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., React Development"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Course Description *</Label>
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lab 301, IT Building"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
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
            <Label htmlFor="syllabus">Course Syllabus *</Label>
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
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scheduling Course...
              </>
            ) : (
              "Schedule Course"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function RegisteredStudentsModal({ course, onRefresh }: { course: Course, onRefresh: () => void }) {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRegistrations()
    }
  }, [isOpen, course.id])

  const loadRegistrations = async () => {
    try {
      setIsLoading(true)
      const response = await api.courses.getRegistrations(course.id)
      setRegistrations(response.data || [])
    } catch (err: any) {
      console.error('Failed to load registrations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportStudentList = () => {
    // Generate CSV
    const headers = "Name,Email,SAP ID,Registration Date\n"
    const rows = registrations.map(reg => {
      const name = reg.student?.name || "Unknown"
      const email = reg.student?.email || "Unknown"
      const sapid = reg.student?.sapid || "N/A"
      const date = new Date(reg.registration_date).toLocaleDateString()
      return `${name},${email},${sapid},${date}`
    }).join("\n")
    
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course_${course.id}_registrations.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          View Students ({course.current_enrollments})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registered Students - {course.title}</DialogTitle>
          <DialogDescription>
            Students who have registered for this crash course
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? "Loading..." : `${registrations.length} students registered`}
            </p>
            <Button onClick={exportStudentList} size="sm" className="gap-2" disabled={registrations.length === 0}>
              <Download className="w-4 h-4" />
              Export List
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students registered yet.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">SAP ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {registration.student?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {registration.student?.email || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {registration.student?.sapid || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(registration.registration_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResourcesOverview({ resources, onRefresh, onEdit, onDelete }: {
  resources: Resource[]
  onRefresh: () => void
  onEdit: (resource: Resource) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Posted Resources ({resources.length})
        </h3>
      </div>
      
      {resources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No resources posted yet. Post your first resource above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      {resource.resource_type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(resource)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(resource.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Views:</span>
                    <p className="font-medium">{resource.views || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                    <p className="font-medium">{new Date(resource.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {resource.external_url && (
                  <div className="mt-3">
                    <a href={resource.external_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Open Resource
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CoursesOverview({ courses, onRefresh, onEdit, onDelete }: {
  courses: Course[]
  onRefresh: () => void
  onEdit: (course: Course) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Scheduled Courses ({courses.length})
        </h3>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No courses scheduled yet. Schedule your first course above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{course.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(course.start_date).toLocaleDateString()}
                      </span>
                      {course.schedule?.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.schedule.time}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={course.is_active ? 'default' : 'secondary'}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                    <span className="font-medium ml-1">
                      {course.current_enrollments || 0}/{course.max_students}
                    </span>
                  </div>
                  <RegisteredStudentsModal course={course} onRefresh={onRefresh} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FacultyDashboard() {
  const { user } = useAuthStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadResources = async () => {
    try {
      setIsLoadingResources(true)
      const response = await api.resources.list(user?.id)
      setResources(response.data || [])
    } catch (err: any) {
      console.error('Failed to load resources:', err)
      setError(err.response?.data?.detail || "Failed to load resources")
    } finally {
      setIsLoadingResources(false)
    }
  }

  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true)
      const response = await api.courses.list(user?.id)
      setCourses(response.data || [])
    } catch (err: any) {
      console.error('Failed to load courses:', err)
      setError(err.response?.data?.detail || "Failed to load courses")
    } finally {
      setIsLoadingCourses(false)
    }
  }

  useEffect(() => {
    loadResources()
    loadCourses()
  }, [user?.id])

  const router = useRouter()
  
  const handleEditResource = async (resource: Resource) => {
    // Navigate to resources page where full edit functionality exists
    router.push('/dashboard/faculty/resources')
    // Note: Full edit dialog is available on the Resources page
  }

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return
    }

    try {
      await api.resources.delete(resourceId)
      loadResources()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete resource")
    }
  }

  const handleEditCourse = async (course: Course) => {
    // Navigate to courses page where full edit functionality exists
    router.push('/dashboard/faculty/courses')
    // Note: Full edit dialog is available on the Courses page
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return
    }

    try {
      await api.courses.delete(courseId)
      loadCourses()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete course")
    }
  }

  const displayUser = user ? {
    id: user.id?.toString() || "2",
    name: user.profile_data?.first_name && user.profile_data?.last_name
      ? `${user.profile_data.first_name} ${user.profile_data.last_name}`
      : user.email?.split('@')[0] || "Faculty",
    email: user.email || "",
    role: "faculty" as const,
    department: user.profile_data?.department || "Computer Engineering"
  } : {
    id: "2",
    name: "Faculty",
    email: "",
    role: "faculty" as const,
    department: "Computer Engineering"
  }

  // Calculate stats from real data
  const totalResources = resources.length
  const totalCourses = courses.length
  const totalRegistrations = courses.reduce((sum, course) => sum + (course.current_enrollments || 0), 0)
  const totalViews = resources.reduce((sum, resource) => sum + (resource.views || 0), 0)

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <FacultyHeader />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                {isLoadingResources ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalResources}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Resources Posted</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                {isLoadingCourses ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Courses Scheduled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                {isLoadingCourses ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRegistrations}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                {isLoadingResources ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
                )}
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
              <ResourceForm onResourceCreated={loadResources} />
            </TabsContent>

            <TabsContent value="schedule-course">
              <CourseSchedulerForm onCourseCreated={loadCourses} />
            </TabsContent>

            <TabsContent value="resources">
              {isLoadingResources ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading resources...</span>
                </div>
              ) : (
                <ResourcesOverview 
                  resources={resources} 
                  onRefresh={loadResources}
                  onEdit={handleEditResource}
                  onDelete={handleDeleteResource}
                />
              )}
            </TabsContent>

            <TabsContent value="courses">
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading courses...</span>
                </div>
              ) : (
                <CoursesOverview 
                  courses={courses} 
                  onRefresh={loadCourses}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
