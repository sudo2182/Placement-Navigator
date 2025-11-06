"use client"

import { useMemo, useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users,
  Search,
  Filter,
  Mail,
  Download,
  Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Course {
  id: number
  title: string
}

interface Registration {
  id: number
  student_id: number
  course_id: number
  registration_date: string
  status: string
  student?: {
    id: number
    email: string
    first_name?: string
    last_name?: string
    profile_data?: any
  }
}

export default function RegisteredStudentsPage() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true)
        setError(null)
        const response = await api.courses.list(user?.id)
        const coursesData = response.data.map((course: any) => ({
          id: course.id,
          title: course.title
        }))
        setCourses(coursesData)
        if (coursesData.length > 0) {
          setSelectedCourseId(String(coursesData[0].id))
        }
      } catch (err: any) {
        console.error('Failed to load courses:', err)
        setError(err.response?.data?.detail || "Failed to load courses")
      } finally {
        setIsLoadingCourses(false)
      }
    }
    
    loadCourses()
  }, [user?.id])

  // Load registrations when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      loadRegistrations(parseInt(selectedCourseId))
    }
  }, [selectedCourseId])

  const loadRegistrations = async (courseId: number) => {
    try {
      setIsLoadingRegistrations(true)
      setError(null)
      const response = await api.courses.getRegistrations(courseId)
      
      // Fetch student details for each registration
      const registrationsWithStudents = await Promise.all(
        (response.data || []).map(async (reg: any) => {
          try {
            const profileResponse = await api.profiles.getUserProfile(reg.student_id)
            return {
              ...reg,
              student: {
                id: profileResponse.data.id,
                email: profileResponse.data.email,
                first_name: profileResponse.data.profile_data?.personal?.first_name || "",
                last_name: profileResponse.data.profile_data?.personal?.last_name || "",
                profile_data: profileResponse.data.profile_data
              }
            }
          } catch (err) {
            return {
              ...reg,
              student: {
                id: reg.student_id,
                email: "Unknown",
                first_name: "",
                last_name: ""
              }
            }
          }
        })
      )
      
      setRegistrations(registrationsWithStudents)
    } catch (err: any) {
      console.error('Failed to load registrations:', err)
      setError(err.response?.data?.detail || "Failed to load registrations")
    } finally {
      setIsLoadingRegistrations(false)
    }
  }

  const filtered = useMemo(() => {
    return registrations.filter(reg => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      const name = `${reg.student?.first_name || ""} ${reg.student?.last_name || ""}`.trim().toLowerCase()
      const email = reg.student?.email?.toLowerCase() || ""
      const sapid = reg.student?.profile_data?.academic?.sapid || ""
      return name.includes(searchLower) || email.includes(searchLower) || sapid.includes(searchLower)
    })
  }, [registrations, search])

  const exportList = () => {
    // Generate CSV
    const headers = "Name,Email,SAP ID,Branch,Registration Date\n"
    const rows = filtered.map(reg => {
      const name = `${reg.student?.first_name || ""} ${reg.student?.last_name || ""}`.trim() || "Unknown"
      const email = reg.student?.email || "Unknown"
      const sapid = reg.student?.profile_data?.academic?.sapid || "N/A"
      const branch = reg.student?.profile_data?.academic?.branch || "N/A"
      const date = new Date(reg.registration_date).toLocaleDateString()
      return `${name},${email},${sapid},${branch},${date}`
    }).join("\n")
    
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course_${selectedCourseId}_registrations.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const mailAll = () => {
    const emails = filtered.map(reg => reg.student?.email).filter(Boolean).join(',')
    if (emails) {
      window.location.href = `mailto:${emails}`
    } else {
      alert("No email addresses available")
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registered Students</h1>
          <Badge className="text-xs">Faculty</Badge>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students by Course
            </CardTitle>
            <CardDescription>Filter, search, and export student registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                {isLoadingCourses ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading courses...</span>
                  </div>
                ) : (
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, SAP ID, or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoadingRegistrations ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${filtered.length} students`
                )}
              </p>
              <div className="flex gap-2">
                <Button onClick={mailAll} variant="secondary" className="gap-2" disabled={filtered.length === 0}>
                  <Mail className="w-4 h-4" />
                  Mail All
                </Button>
                <Button onClick={exportList} className="gap-2" disabled={filtered.length === 0}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {isLoadingRegistrations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading registrations...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedCourseId ? "No students registered for this course yet." : "Please select a course to view registrations."}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SAP ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Registration Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((registration) => {
                      const name = `${registration.student?.first_name || ""} ${registration.student?.last_name || ""}`.trim() || "Unknown"
                      const sapid = registration.student?.profile_data?.academic?.sapid || "N/A"
                      const branch = registration.student?.profile_data?.academic?.branch || "N/A"
                      
                      return (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>{sapid}</TableCell>
                          <TableCell>{registration.student?.email || "Unknown"}</TableCell>
                          <TableCell>{branch}</TableCell>
                          <TableCell>{new Date(registration.registration_date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
