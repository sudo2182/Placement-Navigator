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
import { 
  BookOpen, 
  Plus, 
  FileText,
  Video,
  ExternalLink,
  Edit,
  Trash2
} from "lucide-react"

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
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Resource posted successfully! (Mock)")
      setFormData({ title: "", description: "", type: "", url: "", targetDepartment: "" })
    }, 1200)
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

function ResourcesOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Posted Resources ({postedResources.length})
        </CardTitle>
        <CardDescription>
          Manage and view your previously posted materials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {postedResources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      {resource.type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : resource.type === 'document' ? (
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
      </CardContent>
    </Card>
  )
}

export default function FacultyResourcesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Resources</h1>
          <Badge className="text-xs">Faculty</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceForm />
          <ResourcesOverview />
        </div>
      </div>
    </AppLayout>
  )
}