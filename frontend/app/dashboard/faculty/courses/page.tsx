"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  GraduationCap,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Users,
  Download,
  Loader2,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

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
            <Label>Course Dates (Alternative)</Label>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                className="rounded-md"
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
          View Students ({course.current_enrollments || 0})
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

function CoursesOverview({ courses, onRefresh, onEdit, onDelete }: {
  courses: Course[]
  onRefresh: () => void
  onEdit: (course: Course) => void
  onDelete: (id: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Scheduled Courses ({courses.length})
        </CardTitle>
        <CardDescription>Manage previously scheduled crash courses</CardDescription>
      </CardHeader>
      <CardContent>
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
                    <div className="flex gap-2">
                      <RegisteredStudentsModal course={course} onRefresh={onRefresh} />
                      <Button variant="ghost" size="sm" onClick={() => onEdit(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FacultyCoursesPage() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editFormData, setEditFormData] = useState({
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

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.courses.list(user?.id)
      setCourses(response.data || [])
    } catch (err: any) {
      console.error('Failed to load courses:', err)
      setError(err.response?.data?.detail || "Failed to load courses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [user?.id])

  const handleEditCourse = async (course: Course) => {
    setEditingCourse(course)
    const schedule = typeof course.schedule === 'string' ? JSON.parse(course.schedule) : course.schedule
    setEditFormData({
      title: course.title || "",
      description: course.description || "",
      subject: course.subject || "",
      start_date: course.start_date || "",
      end_date: course.end_date || "",
      time: schedule?.time || "",
      location: schedule?.location || "",
      maxStudents: course.max_students?.toString() || "",
      prerequisites: schedule?.prerequisites || "",
      syllabus: schedule?.syllabus || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse || !editFormData.title || !editFormData.subject) {
      setError("Title and subject are required")
      return
    }

    try {
      setError(null)
      const schedule = {
        days: editFormData.prerequisites ? editFormData.prerequisites.split('\n').filter(d => d.trim()) : [],
        time: editFormData.time,
        location: editFormData.location,
        prerequisites: editFormData.prerequisites ? editFormData.prerequisites.split('\n').filter(p => p.trim()) : [],
        syllabus: editFormData.syllabus ? editFormData.syllabus.split('\n').filter(s => s.trim()) : []
      }

      const courseData = {
        title: editFormData.title,
        description: editFormData.description || null,
        subject: editFormData.subject,
        start_date: editFormData.start_date || null,
        end_date: editFormData.end_date || null,
        schedule: schedule,
        max_students: parseInt(editFormData.maxStudents) || 30
      }

      await api.courses.update(editingCourse.id, courseData)
      
      setIsEditDialogOpen(false)
      setEditingCourse(null)
      loadCourses()
    } catch (err: any) {
      console.error('Failed to update course:', err)
      setError(err.response?.data?.detail || "Failed to update course")
    }
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

  return (
    <AppLayout user={displayUser}>
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Course</h1>
          <Badge className="text-xs">Faculty</Badge>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading courses...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourseSchedulerForm onCourseCreated={loadCourses} />
            <CoursesOverview 
              courses={courses} 
              onRefresh={loadCourses}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Title *</Label>
                  <Input
                    placeholder="Enter course title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="e.g., React Development"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the course content and objectives"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editFormData.start_date}
                    onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editFormData.end_date}
                    onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    placeholder="e.g., 10:00 AM - 4:00 PM"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Lab 301, IT Building"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData({ ...editFormData, maxStudents: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prerequisites (one per line)</Label>
                <Textarea
                  placeholder="List the prerequisites (one per line)"
                  value={editFormData.prerequisites}
                  onChange={(e) => setEditFormData({ ...editFormData, prerequisites: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Syllabus (one topic per line)</Label>
                <Textarea
                  placeholder="Outline the course curriculum (one topic per line)"
                  value={editFormData.syllabus}
                  onChange={(e) => setEditFormData({ ...editFormData, syllabus: e.target.value })}
                  rows={4}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingCourse(null)
                  setError(null)
                }}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateCourse}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
