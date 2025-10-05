"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Award, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Github,
  Linkedin
} from "lucide-react"
import Link from "next/link"

// Default data structure
const defaultData = {
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    linkedin: "",
    github: "",
    portfolio: ""
  },
  academic: {
    sapid: "",
    course: "",
    specialization: "",
    year: "",
    cgpa: "",
    semester: "",
    expectedGraduation: "",
    tenthMarks: "",
    tenthBoard: "",
    tenthYear: "",
    twelfthMarks: "",
    twelfthBoard: "",
    twelfthYear: ""
  },
  internships: [],
  projects: [],
  skills: {
    technical: [],
    tools: [],
    soft: []
  },
  achievements: [],
  certifications: []
}

function PersonalDetailsTab({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={data.gender} onValueChange={(value) => onChange('gender', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => onChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Profile</Label>
          <Input
            id="github"
            value={data.github}
            onChange={(e) => onChange('github', e.target.value)}
            placeholder="https://github.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio Website</Label>
          <Input
            id="portfolio"
            value={data.portfolio}
            onChange={(e) => onChange('portfolio', e.target.value)}
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>
    </div>
  )
}

function AcademicInfoTab({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sapid">SAP ID *</Label>
          <Input
            id="sapid"
            value={data.sapid}
            onChange={(e) => onChange('sapid', e.target.value)}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course">Course *</Label>
          <Input
            id="course"
            value={data.course}
            onChange={(e) => onChange('course', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={data.specialization}
            onChange={(e) => onChange('specialization', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Current Year *</Label>
          <Select value={data.year} onValueChange={(value) => onChange('year', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First Year">First Year</SelectItem>
              <SelectItem value="Second Year">Second Year</SelectItem>
              <SelectItem value="Third Year">Third Year</SelectItem>
              <SelectItem value="Final Year">Final Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cgpa">Current CGPA *</Label>
          <Input
            id="cgpa"
            value={data.cgpa}
            onChange={(e) => onChange('cgpa', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">Expected Graduation *</Label>
          <Input
            id="expectedGraduation"
            type="month"
            value={data.expectedGraduation}
            onChange={(e) => onChange('expectedGraduation', e.target.value)}
          />
        </div>
      </div>

      {/* 10th Grade Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">10th Grade Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tenthMarks">Percentage/CGPA *</Label>
            <Input
              id="tenthMarks"
              value={data.tenthMarks}
              onChange={(e) => onChange('tenthMarks', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenthBoard">Board *</Label>
            <Select value={data.tenthBoard} onValueChange={(value) => onChange('tenthBoard', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="State Board">State Board</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenthYear">Year of Passing *</Label>
            <Input
              id="tenthYear"
              value={data.tenthYear}
              onChange={(e) => onChange('tenthYear', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 12th Grade Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">12th Grade Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twelfthMarks">Percentage/CGPA *</Label>
            <Input
              id="twelfthMarks"
              value={data.twelfthMarks}
              onChange={(e) => onChange('twelfthMarks', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfthBoard">Board *</Label>
            <Select value={data.twelfthBoard} onValueChange={(value) => onChange('twelfthBoard', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="State Board">State Board</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfthYear">Year of Passing *</Label>
            <Input
              id="twelfthYear"
              value={data.twelfthYear}
              onChange={(e) => onChange('twelfthYear', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InternshipsTab({ data, onChange }: any) {
  const addInternship = () => {
    const newInternship = {
      id: Date.now(),
      company: "",
      position: "",
      duration: "",
      location: "",
      description: ""
    }
    onChange([...data, newInternship])
  }

  const updateInternship = (id: number, field: string, value: string) => {
    const updated = data.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  const removeInternship = (id: number) => {
    onChange(data.filter((item: any) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Internship Experience</h3>
        <Button onClick={addInternship} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Internship
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No internships added yet</p>
          <Button onClick={addInternship} variant="outline" className="mt-4">
            Add Your First Internship
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((internship: any) => (
            <Card key={internship.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Internship #{internship.id}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInternship(internship.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={internship.company}
                      onChange={(e) => updateInternship(internship.id, 'company', e.target.value)}
                      placeholder="e.g., Google"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input
                      value={internship.position}
                      onChange={(e) => updateInternship(internship.id, 'position', e.target.value)}
                      placeholder="e.g., Software Engineering Intern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input
                      value={internship.duration}
                      onChange={(e) => updateInternship(internship.id, 'duration', e.target.value)}
                      placeholder="e.g., Jun 2023 - Aug 2023"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={internship.location}
                      onChange={(e) => updateInternship(internship.id, 'location', e.target.value)}
                      placeholder="e.g., Bangalore, India"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={internship.description}
                    onChange={(e) => updateInternship(internship.id, 'description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ data, onChange }: any) {
  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: "",
      technologies: "",
      duration: "",
      description: "",
      github: ""
    }
    onChange([...data, newProject])
  }

  const updateProject = (id: number, field: string, value: string) => {
    const updated = data.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  const removeProject = (id: number) => {
    onChange(data.filter((item: any) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button onClick={addProject} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No projects added yet</p>
          <Button onClick={addProject} variant="outline" className="mt-4">
            Add Your First Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((project: any) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Project #{project.id}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Title *</Label>
                    <Input
                      value={project.title}
                      onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                      placeholder="e.g., Campus Connect"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technologies Used *</Label>
                    <Input
                      value={project.technologies}
                      onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={project.duration}
                      onChange={(e) => updateProject(project.id, 'duration', e.target.value)}
                      placeholder="e.g., Jan 2024 - Present"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub/Demo Link</Label>
                    <Input
                      value={project.github}
                      onChange={(e) => updateProject(project.id, 'github', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    placeholder="Describe your project, its features, and your role..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function SkillsTab({ data, onChange }: any) {
  const addSkill = (category: string) => {
    const skill = prompt(`Add a new ${category} skill:`)
    if (skill && skill.trim()) {
      onChange(category, [...data[category], skill.trim()])
    }
  }

  const removeSkill = (category: string, index: number) => {
    const updated = data[category].filter((_: any, i: number) => i !== index)
    onChange(category, updated)
  }

  return (
    <div className="space-y-8">
      {/* Technical Skills */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Skills
            </CardTitle>
            <Button onClick={() => addSkill('technical')} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.technical.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-2">
                {skill}
                <button
                  onClick={() => removeSkill('technical', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
            {data.technical.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No technical skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tools & Technologies */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tools & Technologies</CardTitle>
            <Button onClick={() => addSkill('tools')} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.tools.map((tool: string, index: number) => (
              <Badge key={index} variant="outline" className="gap-2">
                {tool}
                <button
                  onClick={() => removeSkill('tools', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
            {data.tools.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No tools added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Soft Skills */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Soft Skills</CardTitle>
            <Button onClick={() => addSkill('soft')} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.soft.map((skill: string, index: number) => (
              <Badge key={index} className="gap-2">
                {skill}
                <button
                  onClick={() => removeSkill('soft', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
            {data.soft.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No soft skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResumeDataPage() {
  const [formData, setFormData] = useState(defaultData)
  const [activeTab, setActiveTab] = useState("personal")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updatePersonalData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }))
  }

  const updateAcademicData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      academic: { ...prev.academic, [field]: value }
    }))
  }

  const updateInternships = (internships: any[]) => {
    setFormData(prev => ({ ...prev, internships }))
  }

  const updateProjects = (projects: any[]) => {
    setFormData(prev => ({ ...prev, projects }))
  }

  const updateSkills = (category: string, skills: string[]) => {
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: skills }
    }))
  }

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const profile = await api.profiles.getMyProfile()
        if (profile && profile.profile_data) {
          setFormData(profile.profile_data)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await api.profiles.updateMyProfile(formData)
      setLastSaved(new Date())
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile data')
    } finally {
      setIsSaving(false)
    }
  }

  const calculateCompletion = () => {
    let completed = 0
    let total = 0

    // Personal details (8 required fields)
    const personalRequired = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address']
    personalRequired.forEach(field => {
      total++
      if (formData.personal[field as keyof typeof formData.personal]) completed++
    })

    // Academic details (6 required fields)
    const academicRequired = ['course', 'year', 'cgpa', 'expectedGraduation', 'tenthMarks', 'twelfthMarks']
    academicRequired.forEach(field => {
      total++
      if (formData.academic[field as keyof typeof formData.academic]) completed++
    })

    // At least one internship or project
    total += 2
    if (formData.internships.length > 0) completed++
    if (formData.projects.length > 0) completed++

    // At least 3 technical skills
    total++
    if (formData.skills.technical.length >= 3) completed++

    return Math.round((completed / total) * 100)
  }

  const completion = calculateCompletion()

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

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
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Resume Data Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your academic and professional information
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="p-4 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                    <span className="text-sm font-medium">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-2" />
                </Card>
                
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
            
            {lastSaved && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="personal" className="gap-2">
                <User className="w-4 h-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="internships" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Internships
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <Code className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-2">
                <Award className="w-4 h-4" />
                Skills
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Basic personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PersonalDetailsTab 
                      data={formData.personal} 
                      onChange={updatePersonalData} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Information</CardTitle>
                    <CardDescription>
                      Educational background and academic performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AcademicInfoTab 
                      data={formData.academic} 
                      onChange={updateAcademicData} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="internships">
                <InternshipsTab 
                  data={formData.internships} 
                  onChange={updateInternships} 
                />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsTab 
                  data={formData.projects} 
                  onChange={updateProjects} 
                />
              </TabsContent>

              <TabsContent value="skills">
                <SkillsTab 
                  data={formData.skills} 
                  onChange={updateSkills} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}