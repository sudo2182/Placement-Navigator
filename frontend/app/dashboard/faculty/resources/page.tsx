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
import { 
  BookOpen, 
  Plus, 
  FileText,
  Video,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

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
      setFormData({ title: "", description: "", type: "", url: "", tags: "" })
      
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

function ResourcesOverview({ resources, onRefresh, onEdit, onDelete }: {
  resources: Resource[]
  onRefresh: () => void
  onEdit: (resource: Resource) => void
  onDelete: (id: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Posted Resources ({resources.length})
        </CardTitle>
        <CardDescription>
          Manage and view your previously posted materials
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                        ) : resource.resource_type === 'document' ? (
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
      </CardContent>
    </Card>
  )
}

export default function FacultyResourcesPage() {
  const { user } = useAuthStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    type: "",
    url: "",
    tags: ""
  })

  const loadResources = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.resources.list(user?.id)
      setResources(response.data || [])
    } catch (err: any) {
      console.error('Failed to load resources:', err)
      setError(err.response?.data?.detail || "Failed to load resources")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [user?.id])

  const handleEditResource = async (resource: Resource) => {
    setEditingResource(resource)
    setEditFormData({
      title: resource.title || "",
      description: resource.description || "",
      type: resource.resource_type || "",
      url: resource.external_url || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateResource = async () => {
    if (!editingResource || !editFormData.title || !editFormData.type) {
      setError("Title and type are required")
      return
    }

    try {
      setError(null)
      const resourceData = {
        title: editFormData.title,
        description: editFormData.description || null,
        resource_type: editFormData.type,
        external_url: editFormData.url || null,
        tags: editFormData.tags ? editFormData.tags.split(',').map(t => t.trim()) : [],
        is_public: true
      }

      await api.resources.update(editingResource.id, resourceData)
      
      setIsEditDialogOpen(false)
      setEditingResource(null)
      loadResources()
    } catch (err: any) {
      console.error('Failed to update resource:', err)
      setError(err.response?.data?.detail || "Failed to update resource")
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Resources</h1>
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
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading resources...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResourceForm onResourceCreated={loadResources} />
            <ResourcesOverview 
              resources={resources} 
              onRefresh={loadResources}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
            />
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Title *</Label>
                  <Input
                    placeholder="Enter resource title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resource Type *</Label>
                  <Select value={editFormData.type} onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document/PDF</SelectItem>
                      <SelectItem value="video">Video/Playlist</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the resource and its benefits"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>External URL</Label>
                <Input
                  placeholder="https://example.com/resource"
                  value={editFormData.url}
                  onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="e.g. DSA, Programming, Interview Prep"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
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
                  setEditingResource(null)
                  setError(null)
                }}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateResource}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
