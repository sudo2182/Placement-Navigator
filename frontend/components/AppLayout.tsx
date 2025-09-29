"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  Home, 
  FileText, 
  Briefcase, 
  BookOpen,
  Users,
  Upload,
  BarChart3,
  Calendar,
  Target,
  Award,
  Building2,
  Moon,
  Sun
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "faculty" | "tpo"
  avatar?: string
  sapid?: string
  course?: string
  year?: string
  department?: string
}

interface AppLayoutProps {
  children: React.ReactNode
  user?: User
}

const navigationItems = {
  student: [
    { href: "/dashboard/student", label: "Dashboard", icon: Home },
    { href: "/dashboard/student/opt-out", label: "Opt Out Form", icon: FileText },
    { href: "/dashboard/student/resume", label: "Resume Data", icon: User },
    { href: "/dashboard/student/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/dashboard/student/preparation", label: "Preparation", icon: BookOpen },
  ],
  faculty: [
    { href: "/dashboard/faculty", label: "Dashboard", icon: Home },
    { href: "/dashboard/faculty/resources", label: "Post Resources", icon: BookOpen },
    { href: "/dashboard/faculty/courses", label: "Schedule Course", icon: Calendar },
    { href: "/dashboard/faculty/students", label: "Registered Students", icon: Users },
  ],
  tpo: [
    { href: "/dashboard/tpo", label: "Dashboard", icon: Home },
    { href: "/dashboard/tpo/jobs", label: "Job Management", icon: Briefcase },
    { href: "/dashboard/tpo/upload", label: "Student Data Upload", icon: Upload },
    { href: "/dashboard/tpo/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/tpo/companies", label: "Companies", icon: Building2 },
  ]
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Mock user data if not provided
  const currentUser: User = user || {
    id: "1",
    name: "John Doe",
    email: "student@example.com",
    role: "student",
    sapid: "60004210001",
    course: "Computer Engineering",
    year: "Final Year"
  }

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "faculty":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "tpo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const currentNavItems = navigationItems[currentUser.role] || []

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? "w-full" : "w-64 lg:w-72"} h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col`}>
      {/* Logo and branding */}
      <div className={`${isMobile ? "p-4" : "p-4 lg:p-6"} border-b border-gray-200 dark:border-slate-700`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <Target className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">Placement Navigator</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Career Management</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className={`${isMobile ? "p-4" : "p-4 lg:p-6"} border-b border-gray-200 dark:border-slate-700`}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm lg:text-base">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">
              {currentUser.email}
            </p>
            <Badge className={`mt-1 text-xs ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Additional user info for students */}
        {currentUser.role === "student" && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentUser.sapid && (
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">SAP ID:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{currentUser.sapid}</p>
                </div>
              )}
              {currentUser.course && (
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Course:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{currentUser.course}</p>
                </div>
              )}
              {currentUser.year && (
                <div className="col-span-1 sm:col-span-2 min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Year:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{currentUser.year}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings and logout */}
      <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-slate-700 space-y-1 lg:space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-2 lg:gap-3 text-gray-700 dark:text-gray-300 text-sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
          <span className="truncate">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 lg:gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="truncate">Sign Out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:w-80">
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2 min-w-0 flex-1 justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">Placement Navigator</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}