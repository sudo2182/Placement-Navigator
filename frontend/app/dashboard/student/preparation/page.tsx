"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  Play,
  FileText,
  Video,
  Link as LinkIcon,
  GraduationCap,
  Target,
  Award,
  CheckCircle,
  User,
  MapPin,
  CalendarDays,
  Download,
  Star,
  TrendingUp,
  Bookmark,
  Share2
} from "lucide-react"
import Link from "next/link"

// Mock resources data
const resourcesData = [
  {
    id: 1,
    title: "Data Structures and Algorithms Complete Guide",
    description: "Comprehensive guide covering all important DSA topics with examples and practice problems.",
    type: "document",
    url: "https://example.com/dsa-guide",
    faculty: "Dr. Priya Sharma",
    department: "Computer Engineering",
    postedDate: "2024-01-15",
    tags: ["DSA", "Programming", "Interview Prep"],
    rating: 4.8,
    views: 1250
  },
  {
    id: 2,
    title: "System Design Interview Preparation",
    description: "Video series covering system design concepts for technical interviews at top companies.",
    type: "video",
    url: "https://youtube.com/playlist?list=example",
    faculty: "Prof. Rajesh Kumar",
    department: "Computer Engineering",
    postedDate: "2024-01-20",
    tags: ["System Design", "Interview", "Architecture"],
    rating: 4.9,
    views: 890
  },
  {
    id: 3,
    title: "JavaScript Modern Development Practices",
    description: "Learn modern JavaScript, ES6+ features, and best practices for web development.",
    type: "link",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    faculty: "Dr. Anita Desai",
    department: "IT",
    postedDate: "2024-01-18",
    tags: ["JavaScript", "Web Development", "Frontend"],
    rating: 4.7,
    views: 675
  },
  {
    id: 4,
    title: "Machine Learning Fundamentals",
    description: "Introduction to ML concepts, algorithms, and practical implementation using Python.",
    type: "document",
    url: "https://example.com/ml-fundamentals",
    faculty: "Dr. Suresh Patel",
    department: "Computer Engineering",
    postedDate: "2024-01-22",
    tags: ["Machine Learning", "Python", "AI"],
    rating: 4.6,
    views: 543
  }
]

// Mock crash courses data
const crashCoursesData = [
  {
    id: 1,
    title: "Advanced React Development Bootcamp",
    description: "Intensive 3-day bootcamp covering React hooks, context, performance optimization, and testing.",
    instructor: "Prof. Meera Joshi",
    department: "Computer Engineering",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    duration: "3 days",
    time: "10:00 AM - 4:00 PM",
    location: "Lab 301, IT Building",
    maxStudents: 30,
    registeredStudents: 18,
    prerequisites: ["Basic React knowledge", "JavaScript ES6+"],
    syllabus: [
      "Advanced React Hooks",
      "State Management with Context",
      "Performance Optimization",
      "Testing React Applications",
      "Deployment Strategies"
    ],
    tags: ["React", "Frontend", "JavaScript"],
    status: "open"
  },
  {
    id: 2,
    title: "Data Science with Python",
    description: "Learn data analysis, visualization, and machine learning using Python libraries.",
    instructor: "Dr. Amit Verma",
    department: "Computer Engineering",
    startDate: "2024-02-20",
    endDate: "2024-02-24",
    duration: "5 days",
    time: "2:00 PM - 6:00 PM",
    location: "Computer Lab 2",
    maxStudents: 25,
    registeredStudents: 25,
    prerequisites: ["Python basics", "Statistics fundamentals"],
    syllabus: [
      "NumPy and Pandas",
      "Data Visualization with Matplotlib",
      "Machine Learning with Scikit-learn",
      "Data Cleaning Techniques",
      "Project Implementation"
    ],
    tags: ["Python", "Data Science", "ML"],
    status: "full"
  },
  {
    id: 3,
    title: "Cloud Computing Essentials",
    description: "Introduction to AWS services, deployment strategies, and cloud architecture patterns.",
    instructor: "Prof. Kavita Singh",
    department: "IT",
    startDate: "2024-02-25",
    endDate: "2024-02-27",
    duration: "3 days",
    time: "9:00 AM - 1:00 PM",
    location: "Online (Zoom)",
    maxStudents: 50,
    registeredStudents: 12,
    prerequisites: ["Basic networking knowledge", "Linux fundamentals"],
    syllabus: [
      "AWS Core Services",
      "EC2 and S3 Management",
      "Database Services (RDS)",
      "Load Balancing and Auto Scaling",
      "Security Best Practices"
    ],
    tags: ["AWS", "Cloud", "DevOps"],
    status: "open"
  }
]

function ResourceCard({ resource }: { resource: any }) {
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
            <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <Badge variant="outline" className="mb-2 capitalize">
                {resource.type}
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
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {resource.faculty}
            </span>
            <span>{resource.department}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              {resource.rating}
            </span>
            <span>{resource.views} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Posted on {new Date(resource.postedDate).toLocaleDateString()}
          </span>
          <Button asChild className="gap-2">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Access Resource
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceList({ resources }: { resources: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}

function CrashCourseCard({ course }: { course: any }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const handleRegister = async () => {
    if (course.status === 'full') {
      alert("This course is full. Please try another course.")
      return
    }

    setIsRegistering(true)
    // Mock API call
    setTimeout(() => {
      setIsRegistering(false)
      setIsRegistered(true)
      alert("Successfully registered for the course!")
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'full':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
  }

  const spotsLeft = course.maxStudents - course.registeredStudents

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                by {course.instructor}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(course.status)} variant="outline">
            {course.status === 'open' ? 'Open' : course.status === 'full' ? 'Full' : 'Closed'}
          </Badge>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {course.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
            <p className="font-medium text-sm">{course.duration}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
            <p className="font-medium text-sm">{course.time}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
            <p className="font-medium text-sm">{course.location}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Spots Left</p>
            <p className="font-medium text-sm">{spotsLeft}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Course Dates
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Prerequisites
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              {course.prerequisites.map((prereq: string, index: number) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-3 gap-2">
              <FileText className="w-4 h-4" />
              View Syllabus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{course.title} - Syllabus</DialogTitle>
              <DialogDescription>
                Detailed curriculum for this crash course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <h4 className="font-semibold">Course Outline:</h4>
              <ul className="space-y-2">
                {course.syllabus.map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleRegister}
          disabled={course.status === 'full' || isRegistering || isRegistered}
          className="w-full gap-2"
        >
          {isRegistered ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Registered
            </>
          ) : isRegistering ? (
            "Registering..."
          ) : course.status === 'full' ? (
            "Course Full"
          ) : (
            <>
              <User className="w-4 h-4" />
              Register Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function CrashCourseList({ courses }: { courses: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {courses.map((course) => (
        <CrashCourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export default function PreparationReferencePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("resources")

  const filteredResources = resourcesData.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredCourses = crashCoursesData.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Preparation Resources
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Access study materials and register for crash courses
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search resources and courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{resourcesData.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{crashCoursesData.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Crash Courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registered</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Study Resources
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Crash Courses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Study Resources ({filteredResources.length})
                </h2>
              </div>
              
              {filteredResources.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No resources found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </Card>
              ) : (
                <ResourceList resources={filteredResources} />
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crash Courses ({filteredCourses.length})
                </h2>
              </div>
              
              {filteredCourses.length === 0 ? (
                <Card className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </Card>
              ) : (
                <CrashCourseList courses={filteredCourses} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}