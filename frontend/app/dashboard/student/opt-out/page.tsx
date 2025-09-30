"use client"

import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ArrowLeft,
  Calendar,
  User,
  Building2,
  FileCheck
} from "lucide-react"
import Link from "next/link"

const optOutReasons = [
  { value: "higher_studies", label: "Pursuing Higher Studies" },
  { value: "family_business", label: "Joining Family Business" },
  { value: "startup", label: "Starting Own Business/Startup" },
  { value: "job_secured", label: "Already Secured Job Elsewhere" },
  { value: "personal", label: "Personal Reasons" },
  { value: "health", label: "Health Issues" },
  { value: "other", label: "Other" }
]

// Mock student data
const studentData = {
  name: "Darsh Iyer",
  sapid: "60004210001",
  course: "Computer Engineering",
  year: "Final Year",
  department: "Engineering"
}

function ReasonDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason">Reason for Opt-Out *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a reason for opting out" />
        </SelectTrigger>
        <SelectContent>
          {optOutReasons.map((reason) => (
            <SelectItem key={reason.value} value={reason.value}>
              {reason.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function DownloadButton() {
  const handleDownload = () => {
    // Mock download functionality
    const link = document.createElement('a')
    link.href = '/templates/opt-out-template.docx' // This would be the actual template path
    link.download = 'opt-out-form-template.docx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">
              Download Opt-Out Form Template
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Download the official opt-out form template, fill it out completely, get it signed by your parent/guardian, and upload the signed PDF below.
            </p>
            <Button onClick={handleDownload} className="gap-2 text-sm" size="sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Download Template (.docx)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FileUpload({ file, onFileChange }: { file: File | null; onFileChange: (file: File | null) => void }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        onFileChange(droppedFile)
      } else {
        alert("Please upload a PDF file only.")
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        onFileChange(selectedFile)
      } else {
        alert("Please upload a PDF file only.")
      }
    }
  }

  const removeFile = () => {
    onFileChange(null)
  }

  return (
    <div className="space-y-2">
      <Label>Upload Signed PDF *</Label>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload your signed opt-out form
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              Remove
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Only PDF files are accepted. Maximum file size: 10MB
      </p>
    </div>
  )
}

export default function OptOutPage() {
  const [reason, setReason] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason || !uploadedFile) {
      alert("Please fill in all required fields and upload the signed PDF.")
      return
    }

    setIsSubmitting(true)
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Opt-Out Request Submitted
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                Your opt-out request has been submitted successfully. The TPO office will review your request and get back to you within 3-5 business days.
              </p>
              <Link href="/dashboard/student">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/student">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Placement Opt-Out Form
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Submit your request to opt out of the placement process
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Full Name</Label>
                <p className="font-medium text-gray-900 dark:text-white">{studentData.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">SAP ID</Label>
                <p className="font-medium text-gray-900 dark:text-white">{studentData.sapid}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Course</Label>
                <p className="font-medium text-gray-900 dark:text-white">{studentData.course}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Academic Year</Label>
                <p className="font-medium text-gray-900 dark:text-white">{studentData.year}</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Once you opt out of the placement process, you will not be eligible to participate in any campus recruitment activities for the current academic year. This decision cannot be reversed.
            </AlertDescription>
          </Alert>

          {/* Download Template */}
          <DownloadButton />

          {/* Opt-Out Form */}
          <Card>
            <CardHeader>
              <CardTitle>Opt-Out Request Form</CardTitle>
              <CardDescription>
                Please provide the reason for opting out and upload the signed form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason Selection */}
                <ReasonDropdown value={reason} onChange={setReason} />

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details (Optional)</Label>
                  <Textarea
                    id="details"
                    placeholder="Provide any additional information about your decision..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* File Upload */}
                <FileUpload file={uploadedFile} onFileChange={setUploadedFile} />

                {/* Terms and Conditions */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    By submitting this form, I acknowledge that:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>I understand the consequences of opting out of placements</li>
                      <li>This decision is final and cannot be reversed</li>
                      <li>I have discussed this decision with my parents/guardians</li>
                      <li>All information provided is accurate and truthful</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Link href="/dashboard/student" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isSubmitting || !reason || !uploadedFile}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Opt-Out Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}