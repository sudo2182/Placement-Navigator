"use client"

import { useMemo, useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users,
  Search,
  Filter,
  Mail,
  Download
} from "lucide-react"

// Mock courses and students
const courses = [
  { id: 1, title: "Advanced React Development Bootcamp" },
  { id: 2, title: "Machine Learning Fundamentals" },
  { id: 3, title: "Database Systems Crash Course" },
]

const allStudents = [
  { id: 1, name: "Rahul Sharma", sapid: "60004210001", email: "rahul.sharma@student.edu", branch: "Computer Engineering", courseId: 1 },
  { id: 2, name: "Priya Patel", sapid: "60004210002", email: "priya.patel@student.edu", branch: "Information Technology", courseId: 1 },
  { id: 3, name: "Amit Kumar", sapid: "60004210003", email: "amit.kumar@student.edu", branch: "Computer Engineering", courseId: 2 },
  { id: 4, name: "Neha Gupta", sapid: "60004210004", email: "neha.gupta@student.edu", branch: "Electronics Engineering", courseId: 2 },
  { id: 5, name: "Rohit Verma", sapid: "60004210005", email: "rohit.verma@student.edu", branch: "Mechanical Engineering", courseId: 3 },
]

export default function RegisteredStudentsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("1")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return allStudents.filter(s => (
      (selectedCourseId ? String(s.courseId) === selectedCourseId : true) &&
      (search ? s.name.toLowerCase().includes(search.toLowerCase()) || s.sapid.includes(search) || s.email.toLowerCase().includes(search.toLowerCase()) : true)
    ))
  }, [selectedCourseId, search])

  const exportList = () => {
    alert("Student list exported! (Mock)")
  }

  const mailAll = () => {
    alert("Opening mail composer with student emails... (Mock)")
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registered Students</h1>
          <Badge className="text-xs">Faculty</Badge>
        </div>

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
              <p className="text-sm text-gray-600 dark:text-gray-400">{filtered.length} students</p>
              <div className="flex gap-2">
                <Button onClick={mailAll} variant="secondary" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Mail All
                </Button>
                <Button onClick={exportList} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SAP ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.sapid}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}