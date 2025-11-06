"use client"

import { useRef, useState } from "react"
import { api } from "@/lib/api"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Loader2, XCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"

interface UploadResult {
  sapid: string
  name: string
  status: "imported" | "duplicate" | "error"
  message?: string
}

export default function TpoUploadPage() {
  const { user } = useAuthStore()
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadSummary, setUploadSummary] = useState<{
    total: number
    imported: number
    duplicates: number
    errors: number
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [branchFilter, setBranchFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const handleFile = (file: File) => {
    setFileName(file.name)
    setResults([])
    setUploadSummary(null)
    setError(null)
  }

  const processUpload = async () => {
    if (!fileName || !inputRef.current?.files?.[0]) {
      setError("Please select a file to upload")
      return
    }

    const file = inputRef.current.files[0]
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await api.profiles.bulkUpload(file)
      const data = response.data
      
      setUploadSummary({
        total: data.total || 0,
        imported: data.imported || 0,
        duplicates: data.duplicates || 0,
        errors: data.errors || 0
      })
      
      setResults(data.results || [])
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.response?.data?.detail || "Failed to upload student data")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    // Generate CSV template
    const headers = "sapid,name,branch,email,cgpa,backlogs,year,phone,city,skills,internships,linkedin,github,portfolio,resume,placement_status,graduation_year\n"
    const example = "60004210001,John Doe,Computer Science,john.doe@student.edu,8.5,0,Final Year,9876543210,Mumbai,Python React,Google STEP,linkedin.com/in/johndoe,github.com/johndoe,johndoe.dev,drive.google.com/resume,Open to opportunities,2025\n"
    const csv = headers + example
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_data_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredResults = results.filter(r => {
    const matchesBranch = !branchFilter || r.name.toLowerCase().includes(branchFilter.toLowerCase())
    const matchesStatus = !statusFilter || r.status === statusFilter
    return matchesBranch && matchesStatus
  })

  const displayUser = user ? {
    id: user.id?.toString() || "3",
    name: user.profile_data?.first_name && user.profile_data?.last_name
      ? `${user.profile_data.first_name} ${user.profile_data.last_name}`
      : user.email?.split('@')[0] || "TPO",
    email: user.email || "",
    role: "tpo" as const
  } : {
    id: "3",
    name: "TPO",
    email: "",
    role: "tpo" as const
  }

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Data Upload</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bulk import student records via CSV</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
              <Download className="w-4 h-4" />Download Template
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload CSV</CardTitle>
              <CardDescription>Accepted columns (any subset): sapid, name, branch, email, cgpa, backlogs, year, phone, city, skills, internships, linkedin, github, portfolio, resume, placement_status, graduation_year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Drag & drop CSV here or click to select</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <Button variant="outline" onClick={() => inputRef.current?.click()}>Choose File</Button>
                  <Button disabled={isProcessing || !fileName} onClick={processUpload} className="gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Process
                      </>
                    )}
                  </Button>
                </div>
                {fileName && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Badge variant="outline">{fileName}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileName(null)
                        if (inputRef.current) inputRef.current.value = ""
                        setResults([])
                        setUploadSummary(null)
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Summary */}
          {uploadSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{uploadSummary.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{uploadSummary.imported}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Imported</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{uploadSummary.duplicates}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duplicates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{uploadSummary.errors}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Results</CardTitle>
                <CardDescription>Review imported, duplicate, and error records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Search by Name/Branch</Label>
                    <Input
                      placeholder="Filter results..."
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Filter by Status</Label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">All Status</option>
                      <option value="imported">Imported</option>
                      <option value="duplicate">Duplicate</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SAP ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">
                            No results match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResults.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{result.sapid}</TableCell>
                            <TableCell>{result.name}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  result.status === "imported" ? "default" :
                                  result.status === "duplicate" ? "secondary" :
                                  "destructive"
                                }
                              >
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {result.message || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
