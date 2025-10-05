"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, GraduationCap, Users, Shield, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "next/navigation"

type UserRole = "student" | "faculty" | "tpo" | null

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [error, setError] = useState("")
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedRole) {
      setError("Please select your role first.")
      return
    }

    try {
      await login(loginData.email, loginData.password)
      
      // Redirect based on selected role
      router.push(`/dashboard/${selectedRole}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // TODO: Implement actual forgot password API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setForgotPasswordSent(true)
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] opacity-[0.03] dark:opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at center, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} />
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left brand/hero panel */}
        <div className="hidden md:flex flex-col justify-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-gray-200/60 dark:border-slate-700/60 shadow-xl ring-1 ring-white/60 dark:ring-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Campus Connect</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
            Powering Placements with Precision
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Streamlined workflows for students, faculty, and TPO — publish resources, schedule courses, and manage registrations effortlessly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure student uploads</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish resources & courses</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track registrations</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role-based dashboards</span>
            </div>
          </div>
        </div>

        {/* Right login column */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Back to home link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Card className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border-gray-200 dark:border-slate-700 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {selectedRole ? `Sign in to your ${selectedRole} dashboard` : "Select your role to continue"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              {!selectedRole ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Select Your Role
                    </h3>
                  </div>
                  
                  <div className="grid gap-3">
                    <Button
                      onClick={() => setSelectedRole("student")}
                      variant="outline"
                      className="h-16 flex items-center justify-start gap-4 p-4 border-2 transition-all hover:scale-[1.01] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Student</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Access placement opportunities</div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setSelectedRole("faculty")}
                      variant="outline"
                      className="h-16 flex items-center justify-start gap-4 p-4 border-2 transition-all hover:scale-[1.01] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Faculty</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Manage student placements</div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setSelectedRole("tpo")}
                      variant="outline"
                      className="h-16 flex items-center justify-start gap-4 p-4 border-2 transition-all hover:scale-[1.01] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">TPO (Training & Placement Officer)</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Administrative dashboard</div>
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Back to role selection */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => {
                        setSelectedRole(null)
                        setError("")
                        setLoginData({ email: "", password: "" })
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Change Role
                    </Button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {selectedRole === "student" && <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {selectedRole === "faculty" && <Users className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      {selectedRole === "tpo" && <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      <span className="capitalize font-medium">{selectedRole}</span>
                    </div>
                  </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-10 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10 pr-10 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      {forgotPasswordSent ? (
                        <div className="text-center py-4">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Password reset link sent to {forgotPasswordEmail}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email Address</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="Enter your email"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Don't have an account?{" "}
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Contact your administrator
                </span>
              </p>
            </div>
            </>
            )}
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        {selectedRole && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo Credentials for {selectedRole}:</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Email:</strong> {selectedRole}@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        )}
      </div>
-     </div>
    </div>
  )
}