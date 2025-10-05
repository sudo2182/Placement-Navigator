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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { 
  GraduationCap,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Users,
  Download
} from "lucide-react"

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
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Course scheduled successfully! (Mock)")
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
    }, 1200)
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

function CoursesOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Scheduled Courses ({scheduledCourses.length})
        </CardTitle>
        <CardDescription>Manage previously scheduled crash courses</CardDescription>
      </CardHeader>
      <CardContent>
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
                            {course.registeredStudents} students registered (mock)
                          </p>
                          <Button size="sm" className="gap-2">
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
                              {Array.from({ length: course.registeredStudents }).map((_, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Student {idx + 1}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">6000421{String(idx).padStart(4, '0')}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">student{idx + 1}@example.edu</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Computer Engineering</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FacultyCoursesPage() {
  const mockUser = {
    id: "2",
    name: "Dr. Priya Sharma",
    email: "faculty@example.com",
    role: "faculty" as const,
    department: "Computer Engineering"
  }

  return (
    <AppLayout user={mockUser}>
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Course</h1>
          <Badge className="text-xs">Faculty</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CourseSchedulerForm />
          <CoursesOverview />
        </div>
      </div>
    </AppLayout>
  )
}