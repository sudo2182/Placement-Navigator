"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  User, 
  Briefcase, 
  BookOpen, 
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Building2,
  Clock,
  ExternalLink,
  ChevronRight,
  Target,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

// Real data from API
const useStudentData = () => {
  const { user } = useAuthStore()
  const [studentData, setStudentData] = useState({
    name: user?.profile_data?.name || "Student",
    sapid: user?.id?.toString() || "N/A",
    course: user?.profile_data?.major || "Computer Science",
    year: user?.profile_data?.graduation_year?.toString() || "Final Year",
    cgpa: user?.profile_data?.gpa?.toString() || "N/A",
    profileCompletion: 85,
    appliedJobs: 0,
    interviewsScheduled: 0,
    offersReceived: 0
  })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsResponse = await api.jobs.list()
        setJobs(jobsResponse.data || [])
        setStudentData(prev => ({
          ...prev,
          appliedJobs: jobsResponse.data?.length || 0
        }))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { studentData, jobs, loading }
}

const bulletinData = [
  {
    id: 1,
    title: "Microsoft Campus Drive - Registration Open",
    company: "Microsoft",
    type: "Job Opening",
    deadline: "2024-02-15",
    isNew: true
  },
  {
    id: 2,
    title: "Google Summer Internship Program 2024",
    company: "Google",
    type: "Internship",
    deadline: "2024-02-20",
    isNew: true
  },
  {
    id: 3,
    title: "Technical Interview Preparation Workshop",
    company: "TPO Office",
    type: "Workshop",
    deadline: "2024-02-10",
    isNew: false
  },
  {
    id: 4,
    title: "Amazon SDE Role - Final Year Students",
    company: "Amazon",
    type: "Job Opening",
    deadline: "2024-02-18",
    isNew: false
  },
  {
    id: 5,
    title: "Resume Building Session by Industry Experts",
    company: "TPO Office",
    type: "Workshop",
    deadline: "2024-02-12",
    isNew: false
  }
]

const dashboardNavItems = [
  {
    href: "/dashboard/student/opt-out",
    title: "Opt Out Form",
    description: "Submit opt-out request with required documentation",
    icon: FileText,
    color: "from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20",
    iconColor: "text-red-600 dark:text-red-400"
  },
  {
    href: "/dashboard/student/resume",
    title: "Resume Data",
    description: "Manage your academic and professional information",
    icon: User,
    color: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  {
    href: "/dashboard/student/jobs",
    title: "Job Postings",
    description: "Browse and apply to available job opportunities",
    icon: Briefcase,
    color: "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20",
    iconColor: "text-green-600 dark:text-green-400"
  },
  {
    href: "/dashboard/student/preparation",
    title: "Preparation Reference",
    description: "Access study materials and crash courses",
    icon: BookOpen,
    color: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
    iconColor: "text-purple-600 dark:text-purple-400"
  }
]

// Components
function StudentHeader({ studentData }: { studentData: any }) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
              {studentData.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Welcome back, {studentData.name}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="truncate">SAP ID: {studentData.sapid}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">{studentData.course}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">{studentData.year}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">CGPA: {studentData.cgpa}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="p-3 sm:p-4 min-w-0 sm:min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                <span className="text-xs sm:text-sm font-medium">{studentData.profileCompletion}%</span>
              </div>
              <Progress value={studentData.profileCompletion} className="h-2" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function BulletinBoard() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bulletinData.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Job Opening":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "Internship":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "Workshop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-base sm:text-lg">Bulletin Board</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">Latest opportunities and announcements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {bulletinData.map((item, index) => (
          <div
            key={item.id}
            className={`p-3 sm:p-4 rounded-lg border transition-all duration-500 ${
              index === currentIndex
                ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 scale-105"
                : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                  <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                    {item.type}
                  </Badge>
                  {item.isNew && (
                    <Badge variant="destructive" className="text-xs">
                      NEW
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {item.company}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Pagination dots */}
        <div className="flex justify-center gap-1 sm:gap-2 pt-3 sm:pt-4">
          {bulletinData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-purple-600 dark:bg-purple-400"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardNav() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {dashboardNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${item.color} backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function QuickStats({ studentData }: { studentData: any }) {
  const stats = [
    {
      label: "Applications Sent",
      value: studentData.appliedJobs,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      label: "Interviews Scheduled",
      value: studentData.interviewsScheduled,
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      label: "Offers Received",
      value: studentData.offersReceived,
      icon: Award,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function StudentDashboard() {
  const { studentData, jobs, loading } = useStudentData()
  const { user } = useAuthStore()
  
  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access your dashboard
          </h1>
          <a 
            href="/login" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }
  
  // Use real user data
  const mockUser = {
    id: user?.id?.toString() || "1",
    name: user?.profile_data?.name || "Student",
    email: user?.email || "student@example.com",
    role: "student" as const,
    sapid: user?.id?.toString() || "N/A",
    course: user?.profile_data?.major || "Computer Science",
    year: user?.profile_data?.graduation_year?.toString() || "Final Year"
  }

  if (loading) {
    return (
      <AppLayout user={mockUser}>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <StudentHeader studentData={studentData} />
        
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Quick Stats */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Quick Overview
            </h2>
            <QuickStats studentData={studentData} />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Dashboard Navigation */}
            <div className="xl:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Quick Actions
              </h2>
              <DashboardNav />
            </div>

            {/* Bulletin Board */}
            <div className="xl:col-span-1">
              <BulletinBoard />
            </div>
          </div>

          {/* Recent Activity */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Recent Activity
            </h2>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        Application submitted to Microsoft
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        Interview scheduled with Google
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        Resume data needs update
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}