"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Video, 
  Link as LinkIcon, 
  FileText, 
  ExternalLink, 
  Star, 
  User, 
  Bookmark, 
  Share2, 
  GraduationCap,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

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
  faculty?: {
    name: string
    department?: string
  }
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
  faculty?: {
    name: string
    department?: string
  }
}

function ResourceCard({ resource }: { resource: Resource }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'link':
        return <LinkIcon className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'link':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(resource.resource_type)}`}>
              {getTypeIcon(resource.resource_type)}
            </div>
            <div>
              <Badge variant="outline" className="mb-2 capitalize">
                {resource.resource_type}
              </Badge>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {resource.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {resource.description || "No description available"}
        </p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span>{resource.views || 0} views</span>
            <span>{resource.downloads || 0} downloads</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Posted on {new Date(resource.created_at).toLocaleDateString()}
          </span>
          {(resource.external_url || resource.file_path) && (
            <Button asChild className="gap-2">
              <a href={resource.external_url || resource.file_path || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Access Resource
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CourseCard({ course, onRegister }: { course: Course, onRegister: (id: number) => void }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)
    try {
      await api.courses.register(course.id)
      onRegister(course.id)
    } catch (err: any) {
      console.error('Failed to register:', err)
      setError(err.response?.data?.detail || "Failed to register for course")
    } finally {
      setIsRegistering(false)
    }
  }

  const isFull = course.current_enrollments >= course.max_students
  const daysUntilStart = Math.ceil((new Date(course.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="outline" className="mb-2">
              {course.subject || "General"}
            </Badge>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {course.description}
            </p>
          </div>
          <Badge variant={course.is_active && !isFull ? 'default' : 'secondary'}>
            {isFull ? 'Full' : course.is_active ? 'Open' : 'Closed'}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
            </span>
            {course.schedule?.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.schedule.time}
              </span>
            )}
          </div>
          
          {course.schedule?.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              {course.schedule.location}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              {course.current_enrollments || 0}/{course.max_students} students
            </span>
            {daysUntilStart > 0 && (
              <span className="text-gray-500">
                Starts in {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleRegister} 
          disabled={isRegistering || !course.is_active || isFull}
          className="w-full gap-2"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registering...
            </>
          ) : isFull ? (
            "Course Full"
          ) : !course.is_active ? (
            "Not Available"
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Register Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function StudentPreparationPage() {
  const { user } = useAuthStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadResources = async () => {
    try {
      setIsLoadingResources(true)
      setError(null)
      const response = await api.resources.list(undefined, undefined)
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
      setError(null)
      const response = await api.courses.list(undefined, undefined)
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
  }, [])

  const handleCourseRegistered = (courseId: number) => {
    // Refresh courses to update enrollment counts
    loadCourses()
  }

  const displayUser = user ? {
    id: user.id?.toString() || "1",
    name: user.profile_data?.first_name && user.profile_data?.last_name
      ? `${user.profile_data.first_name} ${user.profile_data.last_name}`
      : user.email?.split('@')[0] || "Student",
    email: user.email || "",
    role: "student" as const,
    sapid: user.profile_data?.student_id || user.id?.toString() || "N/A",
    course: user.profile_data?.branch || "Computer Science",
    year: user.profile_data?.batch || "Final Year"
  } : {
    id: "1",
    name: "Student",
    email: "",
    role: "student" as const,
    sapid: "N/A",
    course: "Computer Science",
    year: "Final Year"
  }

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preparation Resources</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access study materials, crash courses, and resources shared by faculty
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Study Resources Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Study Resources
              </h2>
              <Badge variant="outline">{resources.length} resources</Badge>
            </div>

            {isLoadingResources ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading resources...</span>
              </div>
            ) : resources.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No resources available yet. Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>

          {/* Crash Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Crash Courses
              </h2>
              <Badge variant="outline">{courses.filter(c => c.is_active).length} active</Badge>
            </div>

            {isLoadingCourses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No crash courses available yet. Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses
                  .filter(course => course.is_active)
                  .map((course) => (
                    <CourseCard key={course.id} course={course} onRegister={handleCourseRegistered} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
