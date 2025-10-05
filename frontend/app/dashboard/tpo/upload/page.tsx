"use client"

import { useRef, useState, useEffect } from "react"
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
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react"

const mockUser = { id: "3", name: "Mr. Rajesh Kumar", email: "rajesh.kuma@university.edu", role: "tpo" as const }

// extend UploadResult with realistic optional fields
type UploadResult = {
  sapid: string
  name: string
  branch: string
  email: string
  cgpa: number
  backlogs: number
  year: string
  status: "imported" | "duplicate" | "error"
  message?: string
  phone?: string
  city?: string
  skills?: string[]
  internships?: string[]
  linkedin?: string
  github?: string
  portfolio?: string
  resume?: string
  placementStatus?: string
  graduationYear?: string
}
// Hardcoded realistic multi-student data (demo)
const demoData: UploadResult[] = [
  {
    sapid: "60004210011",
    name: "Darsh Iyer",
    branch: "Computer Science",
    email: "darsh.iyer@example.com",
    cgpa: 8.6,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9898123456",
    city: "Mumbai",
    skills: ["React", "TypeScript", "Node.js"],
    internships: ["TCS Digital Intern", "Smart India Hackathon Winner"],
    linkedin: "linkedin.com/in/darshiyer",
    github: "github.com/darshiyer",
    portfolio: "darsh-iyer.dev",
    resume: "drive.google.com/resume/darsh-iyer",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210001",
    name: "Aditya Ray",
    branch: "Computer Science",
    email: "adityaray@gmail.com",
    cgpa: 8.5,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9812345678",
    city: "Mumbai",
    skills: ["React", "TypeScript", "Node.js"],
    internships: ["Google STEP Intern", "Smart India Hackathon Winner"],
    linkedin: "linkedin.com/in/adityaray",
    github: "github.com/adityaray",
    portfolio: "aditya-ray.dev",
    resume: "drive.google.com/resume/aditya-ray",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210002",
    name: "Ananya Gupta",
    branch: "Information Technology",
    email: "ananya.g@example.com",
    cgpa: 8.2,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9798765432",
    city: "Delhi",
    skills: ["Java", "Spring Boot", "MySQL"],
    internships: ["Infosys Summer Intern"],
    linkedin: "linkedin.com/in/ananyagupta",
    github: "github.com/ananya-gupta",
    portfolio: "ananya.dev",
    resume: "drive.google.com/resume/ananya",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210003",
    name: "Rohan Kulkarni",
    branch: "Electronics",
    email: "rohan.k@example.com",
    cgpa: 7.9,
    backlogs: 1,
    year: "Final Year",
    status: "duplicate",
    message: "Already exists",
    phone: "9876501234",
    city: "Pune",
    skills: ["Embedded C", "Arduino", "MATLAB"],
    internships: ["Bosch R&D Intern", "Robotics Club Lead"],
    linkedin: "linkedin.com/in/rohan-kulkarni",
    github: "github.com/rohankulkarni",
    portfolio: "rohan.tech",
    resume: "drive.google.com/resume/rohan",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210004",
    name: "Neha Verma",
    branch: "Mechanical",
    email: "neha.v@example.com",
    cgpa: 7.1,
    backlogs: 0,
    year: "Third Year",
    status: "error",
    message: "Missing email",
    phone: "9123456780",
    city: "Jaipur",
    skills: ["AutoCAD", "SolidWorks", "FEA"],
    internships: ["Hero MotoCorp Intern"],
    linkedin: "linkedin.com/in/nehaverma",
    github: "github.com/neha-verma",
    portfolio: "neha.design",
    resume: "drive.google.com/resume/neha",
    placementStatus: "Open to opportunities",
    graduationYear: "2026",
  },
  {
    sapid: "60004210005",
    name: "Arjun Mehta",
    branch: "Computer Science",
    email: "arjun.m@example.com",
    cgpa: 8.8,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9812312345",
    city: "Bengaluru",
    skills: ["React", "Next.js", "PostgreSQL"],
    internships: ["Flipkart SWE Intern", "GSoC 2024"],
    linkedin: "linkedin.com/in/arjunmehta",
    github: "github.com/arjunmehta",
    portfolio: "arjun.codes",
    resume: "drive.google.com/resume/arjun",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210006",
    name: "Simran Kaur",
    branch: "Information Technology",
    email: "simran.k@example.com",
    cgpa: 8.0,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9800765432",
    city: "Chandigarh",
    skills: ["Python", "Django", "REST API"],
    internships: ["TCS NQT Topper", "NGO Tech Volunteer"],
    linkedin: "linkedin.com/in/simrankaur",
    github: "github.com/simran-kaur",
    portfolio: "simran.dev",
    resume: "drive.google.com/resume/simran",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210007",
    name: "Siddharth Jain",
    branch: "Electronics",
    email: "siddharth.j@example.com",
    cgpa: 7.6,
    backlogs: 0,
    year: "Third Year",
    status: "imported",
    phone: "9822003344",
    city: "Indore",
    skills: ["VHDL", "Verilog", "FPGA"],
    internships: ["Intel FPGA Workshop", "EEE Society Secretary"],
    linkedin: "linkedin.com/in/siddharthjain",
    github: "github.com/siddjain",
    portfolio: "sidd.tech",
    resume: "drive.google.com/resume/siddharth",
    placementStatus: "Open to opportunities",
    graduationYear: "2026",
  },
  {
    sapid: "60004210008",
    name: "Priya Nair",
    branch: "Computer Science",
    email: "priya.n@example.com",
    cgpa: 9.1,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9844556677",
    city: "Kochi",
    skills: ["Data Structures", "Java", "System Design"],
    internships: ["Amazon SDE Intern", "CodeChef 5*"],
    linkedin: "linkedin.com/in/priyanair",
    github: "github.com/priya-nair",
    portfolio: "priya.codes",
    resume: "drive.google.com/resume/priya",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210009",
    name: "Karan Malhotra",
    branch: "Civil",
    email: "karan.m@example.com",
    cgpa: 7.3,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9811122233",
    city: "Lucknow",
    skills: ["AutoCAD", "STAAD Pro", "Site Mgmt"],
    internships: ["L&T Construction Intern"],
    linkedin: "linkedin.com/in/karanmalhotra",
    github: "github.com/karan-malhotra",
    portfolio: "karan.build",
    resume: "drive.google.com/resume/karan",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210010",
    name: "Aisha Khan",
    branch: "Computer Science",
    email: "aisha.k@example.com",
    cgpa: 8.9,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9877112233",
    city: "Hyderabad",
    skills: ["Python", "ML", "Pandas"],
    internships: ["Microsoft Engage Program", "Kaggle Expert"],
    linkedin: "linkedin.com/in/aishakhan",
    github: "github.com/aisha-khan",
    portfolio: "aisha.dev",
    resume: "drive.google.com/resume/aisha",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210012",
    name: "Nikhil Patil",
    branch: "Mechanical",
    email: "nikhil.p@example.com",
    cgpa: 7.8,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9876001122",
    city: "Pune",
    skills: ["CAD", "SolidWorks", "Manufacturing"],
    internships: ["Tata Motors Intern"],
    linkedin: "linkedin.com/in/nikhilpatil",
    github: "github.com/nikhil-patil",
    portfolio: "nikhil.engineer",
    resume: "drive.google.com/resume/nikhil",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210013",
    name: "Shreya Singh",
    branch: "AI & ML",
    email: "shreya.singh@example.com",
    cgpa: 9.3,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9822456678",
    city: "Delhi",
    skills: ["TensorFlow", "NLP", "Data Science"],
    internships: ["IIT Delhi Research Intern"],
    linkedin: "linkedin.com/in/shreyasingh",
    github: "github.com/shreya-singh",
    portfolio: "shreya.ai",
    resume: "drive.google.com/resume/shreya",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210014",
    name: "Akash Mishra",
    branch: "Data Science",
    email: "akash.m@example.com",
    cgpa: 8.4,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9899007766",
    city: "Noida",
    skills: ["Python", "SQL", "Tableau"],
    internships: ["Zomato Data Analyst Intern"],
    linkedin: "linkedin.com/in/akashmishra",
    github: "github.com/akash-mishra",
    portfolio: "akash.data",
    resume: "drive.google.com/resume/akash",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210015",
    name: "Pranav Joshi",
    branch: "Electrical",
    email: "pranav.j@example.com",
    cgpa: 8.1,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9888776655",
    city: "Ahmedabad",
    skills: ["Power Systems", "MATLAB", "Simulink"],
    internships: ["Adani Power Intern"],
    linkedin: "linkedin.com/in/pranavjoshi",
    github: "github.com/pranav-joshi",
    portfolio: "pranav.ee",
    resume: "drive.google.com/resume/pranav",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210016",
    name: "Sneha Reddy",
    branch: "Computer Science",
    email: "sneha.r@example.com",
    cgpa: 8.7,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9877123456",
    city: "Hyderabad",
    skills: ["JavaScript", "React", "Redux"],
    internships: ["Salesforce Trainee"],
    linkedin: "linkedin.com/in/snehareddy",
    github: "github.com/sneha-reddy",
    portfolio: "sneha.codes",
    resume: "drive.google.com/resume/sneha",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210017",
    name: "Ishika Banerjee",
    branch: "Information Technology",
    email: "ishika.b@example.com",
    cgpa: 8.3,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9876003322",
    city: "Kolkata",
    skills: ["Java", "Spring", "Angular"],
    internships: ["Wipro Intern"],
    linkedin: "linkedin.com/in/ishikabanerjee",
    github: "github.com/ishika-banerjee",
    portfolio: "ishika.dev",
    resume: "drive.google.com/resume/ishika",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210018",
    name: "Parth Shah",
    branch: "Electronics",
    email: "parth.s@example.com",
    cgpa: 8.0,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9898772233",
    city: "Surat",
    skills: ["PCB Design", "Embedded", "C"],
    internships: ["Siemens Intern"],
    linkedin: "linkedin.com/in/parthshah",
    github: "github.com/parth-shah",
    portfolio: "parth.ee",
    resume: "drive.google.com/resume/parth",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210019",
    name: "Devansh Kapoor",
    branch: "Computer Science",
    email: "devansh.k@example.com",
    cgpa: 8.6,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9876654433",
    city: "Jaipur",
    skills: ["Node.js", "Express", "MongoDB"],
    internships: ["Paytm Backend Intern"],
    linkedin: "linkedin.com/in/devanshkapoor",
    github: "github.com/devansh-kapoor",
    portfolio: "devansh.dev",
    resume: "drive.google.com/resume/devansh",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
  {
    sapid: "60004210020",
    name: "Aarav Jain",
    branch: "Computer Science",
    email: "aarav.j@example.com",
    cgpa: 8.9,
    backlogs: 0,
    year: "Final Year",
    status: "imported",
    phone: "9876054321",
    city: "Indore",
    skills: ["Go", "Microservices", "Kubernetes"],
    internships: ["Razorpay SWE Intern"],
    linkedin: "linkedin.com/in/aaravjain",
    github: "github.com/aarav-jain",
    portfolio: "aarav.cloud",
    resume: "drive.google.com/resume/aarav",
    placementStatus: "Open to opportunities",
    graduationYear: "2025",
  },
]
export default function TpoUploadPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [branchFilter, setBranchFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const handleFile = (file: File) => {
    setFileName(file.name)
  }

  const processUpload = async () => {
    setIsProcessing(true)
    try {
      // In a real implementation, this would upload the file to the backend
      // For now, we'll simulate processing
      setTimeout(() => {
        setResults(demoData)
        setIsProcessing(false)
      }, 600)
    } catch (err) {
      console.error('Upload failed:', err)
      setIsProcessing(false)
    }
  }

  // Load students from API
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const profiles = await api.profiles.listProfiles('student')
        setStudents(profiles)
      } catch (err) {
        console.error('Failed to load students:', err)
        setError('Failed to load student data')
        // Fallback to demo data for now
        setResults(demoData)
      } finally {
        setIsLoading(false)
      }
    }
    loadStudents()
  }, [])

  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Data Upload</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">All data on this page is hardcoded for demo purposes. Bulk import student records via CSV.</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => alert("Template downloaded (demo)")}><Download className="w-4 h-4" />Download Template</Button>
          </div>

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
                  <Input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <Button variant="outline" onClick={() => inputRef.current?.click()}>Choose File</Button>
                  <Button disabled={isProcessing} onClick={processUpload} className="gap-2"><FileText className="w-4 h-4" />Process</Button>
                </div>
                {fileName && <p className="mt-2 text-sm"><Badge variant="outline">{fileName}</Badge></p>}
                <Alert className="mt-3">
                  <AlertDescription>Hardcoded demo: Clicking Process loads predefined realistic student data.</AlertDescription>
                </Alert>
              </div>

              {/* Sample Format */}
              <div className="rounded-md bg-gray-100 dark:bg-slate-800 p-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Sample CSV</p>
                <pre className="mt-2 text-xs overflow-auto"><code>{`sapid,name,branch,email,cgpa,backlogs,year,phone,city,skills,internships,linkedin,github,portfolio,resume,placement_status,graduation_year
-60004210001,Aditya Ray,Computer Science,adityaray@gmail.com,8.5,0,Final Year
-60004210002,Ananya Gupta,Information Technology,ananya.g@example.com,8.2,0,Final Year
-60004210003,Rohit Sharma,Electronics,rohit.s@example.com,7.9,1,Final Year
-60004210004,Neha Verma,Mechanical,neha.v@example.com,7.1,0,Third Year
-60004210005,Arjun Mehta,Computer Science,arjun.m@example.com,8.8,0,Final Year
-60004210006,Simran Kaur,Information Technology,simran.k@example.com,8.0,0,Final Year
-60004210007,Siddharth Jain,Electronics,siddharth.j@example.com,7.6,2,Third Year
-60004210008,Priya Nair,Computer Science,priya.n@example.com,9.1,0,Final Year
-60004210009,Karan Malhotra,Civil,karan.m@example.com,7.3,0,Final Year
-60004210010,Aisha Khan,Computer Science,aisha.k@example.com,8.9,0,Final Year
60004210001,Aditya Ray,Computer Science,adityaray@gmail.com,8.5,0,Final Year,9812345678,Mumbai,React;TypeScript;Node.js,Google STEP Intern;Smart India Hackathon Winner,linkedin.com/in/adityaray,github.com/adityaray,aditya-ray.dev,drive.google.com/resume/aditya-ray,Open to opportunities,2025
60004210002,Ananya Gupta,Information Technology,ananya.g@example.com,8.2,0,Final Year,9798765432,Delhi,Java;Spring Boot;MySQL,Infosys Summer Intern,linkedin.com/in/ananyagupta,github.com/ananya-gupta,ananya.dev,drive.google.com/resume/ananya,Open to opportunities,2025
60004210003,Rohit Sharma,Electronics,rohit.s@example.com,7.9,1,Final Year,9876501234,Pune,Embedded C;Arduino;MATLAB,Bosch R&D Intern;Robotics Club Lead,linkedin.com/in/rohit-sharma,github.com/rohitsharma,rohit.tech,drive.google.com/resume/rohit,Open to opportunities,2025
60004210004,Neha Verma,Mechanical,neha.v@example.com,7.1,0,Third Year,9123456780,Jaipur,AutoCAD;SolidWorks;FEA,Hero MotoCorp Intern,linkedin.com/in/nehaverma,github.com/neha-verma,neha.design,drive.google.com/resume/neha,Open to opportunities,2026
60004210005,Arjun Mehta,Computer Science,arjun.m@example.com,8.8,0,Final Year,9812312345,Bengaluru,React;Next.js;PostgreSQL,Flipkart SWE Intern;GSoC 2024,linkedin.com/in/arjunmehta,github.com/arjunmehta,arjun.codes,drive.google.com/resume/arjun,Open to opportunities,2025
60004210006,Simran Kaur,Information Technology,simran.k@example.com,8.0,0,Final Year,9800765432,Chandigarh,Python;Django;REST API,TCS NQT Topper;NGO Tech Volunteer,linkedin.com/in/simrankaur,github.com/simran-kaur,simran.dev,drive.google.com/resume/simran,Open to opportunities,2025
60004210007,Siddharth Jain,Electronics,siddharth.j@example.com,7.6,2,Third Year,9822003344,Indore,VHDL;Verilog;FPGA,Intel FPGA Workshop;EEE Society Secretary,linkedin.com/in/siddharthjain,github.com/siddjain,sidd.tech,drive.google.com/resume/siddharth,Open to opportunities,2026
60004210008,Priya Nair,Computer Science,priya.n@example.com,9.1,0,Final Year,9844556677,Kochi,Data Structures;Java;System Design,Amazon SDE Intern;CodeChef 5*,linkedin.com/in/priyanair,github.com/priya-nair,priya.codes,drive.google.com/resume/priya,Open to opportunities,2025
60004210009,Karan Malhotra,Civil,karan.m@example.com,7.3,0,Final Year,9811122233,Lucknow,AutoCAD;STAAD Pro;Site Mgmt,L&T Construction Intern,linkedin.com/in/karanmalhotra,github.com/karan-malhotra,karan.build,drive.google.com/resume/karan,Open to opportunities,2025
60004210010,Aisha Khan,Computer Science,aisha.k@example.com,8.9,0,Final Year,9877112233,Hyderabad,Python;ML;Pandas,Microsoft Engage Program;Kaggle Expert,linkedin.com/in/aishakhan,github.com/aisha-khan,aisha.dev,drive.google.com/resume/aisha,Open to opportunities,2025`}</code></pre>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Loading student data...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we fetch the latest student information
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 text-red-400 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Error loading student data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : !!results.length && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Import Results</CardTitle>
                <CardDescription>Validation summary of uploaded records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-md border p-3">
                    <p className="text-gray-500">Total</p>
                    <p className="text-lg font-semibold">{results.length}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-gray-500">Imported</p>
                    <p className="text-lg font-semibold">{results.filter(r => r.status === "imported").length}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-gray-500">Duplicates</p>
                    <p className="text-lg font-semibold">{results.filter(r => r.status === "duplicate").length}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-gray-500">Errors</p>
                    <p className="text-lg font-semibold">{results.filter(r => r.status === "error").length}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Button variant="outline" className="gap-2" onClick={() => {
                    const header = [
                      "sapid","name","branch","email","cgpa","backlogs","year","phone","city","skills","internships","linkedin","github","portfolio","resume","placement_status","graduation_year"
                    ]
                    const rows = results.map(r => [
                      r.sapid, r.name, r.branch, r.email, r.cgpa, r.backlogs, r.year, r.phone || "", r.city || "",
                      (r.skills || []).join(";"), (r.internships || []).join(";"), r.linkedin || "", r.github || "", r.portfolio || "", r.resume || "",
                      r.placementStatus || "", r.graduationYear || ""
                    ])
                    const csv = [header.join(","), ...rows.map(row => row.join(","))].join("\n")
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `import_results_${Date.now()}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}><Download className="w-4 h-4" />Export Results CSV</Button>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Filter by Branch</Label>
                    <Input value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Filter by Status</Label>
                    <Input value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="imported | duplicate | error" />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SAP ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">CGPA</TableHead>
                      <TableHead className="text-right">Backlogs</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Profile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .filter(r => (branchFilter ? r.branch.toLowerCase().includes(branchFilter.toLowerCase()) : true))
                      .filter(r => (statusFilter ? r.status === statusFilter.toLowerCase() : true))
                      .map(r => (
                        <TableRow key={r.sapid}>
                          <TableCell className="font-medium">{r.sapid}</TableCell>
                          <TableCell>{r.name}</TableCell>
                          <TableCell>{r.branch}</TableCell>
                          <TableCell>{r.email || "-"}</TableCell>
                          <TableCell className="text-right">{Number.isFinite(r.cgpa) ? r.cgpa.toFixed(2) : "-"}</TableCell>
                          <TableCell className="text-right">{Number.isFinite(r.backlogs) ? r.backlogs : "-"}</TableCell>
                          <TableCell>{r.year}</TableCell>
                          <TableCell>
                            {r.status === "imported" && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Imported</Badge>}
                            {r.status === "duplicate" && <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Duplicate</Badge>}
                            {r.status === "error" && <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Error</Badge>}
                          </TableCell>
                          <TableCell>{r.message || "-"}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>{r.name} — {r.branch}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-gray-500">SAP ID:</span> {r.sapid}</div>
                                    <div><span className="text-gray-500">Year:</span> {r.year}</div>
                                    <div><span className="text-gray-500">CGPA:</span> {Number.isFinite(r.cgpa) ? r.cgpa.toFixed(2) : "-"}</div>
                                    <div><span className="text-gray-500">Backlogs:</span> {Number.isFinite(r.backlogs) ? r.backlogs : "-"}</div>
                                    <div><span className="text-gray-500">Email:</span> {r.email || "-"}</div>
                                    <div><span className="text-gray-500">Phone:</span> {r.phone || "-"}</div>
                                    <div><span className="text-gray-500">City:</span> {r.city || "-"}</div>
                                    <div><span className="text-gray-500">Graduation:</span> {r.graduationYear || "-"}</div>
                                  </div>
                                  {r.skills && r.skills.length > 0 && (
                                    <div>
                                      <p className="text-gray-500">Skills</p>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {r.skills.map((s, idx) => (
                                          <Badge key={idx} variant="outline">{s}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {r.internships && r.internships.length > 0 && (
                                    <div>
                                      <p className="text-gray-500">Internships</p>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {r.internships.map((s, idx) => (
                                          <Badge key={idx} variant="outline">{s}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-gray-500">LinkedIn:</span> {r.linkedin || "-"}</div>
                                    <div><span className="text-gray-500">GitHub:</span> {r.github || "-"}</div>
                                    <div><span className="text-gray-500">Portfolio:</span> {r.portfolio || "-"}</div>
                                    <div><span className="text-gray-500">Resume:</span> {r.resume || "-"}</div>
                                    <div className="col-span-2"><span className="text-gray-500">Placement Status:</span> {r.placementStatus || "-"}</div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Tips</CardTitle>
              <CardDescription>Ensure headers match the sample exactly; values are case-insensitive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>• Keep CGPA in decimal format (e.g., 8.2).</p>
              <p>• Backlogs should be an integer (0 if none).</p>
              <p>• Year can be First Year, Second Year, Third Year, Final Year.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}