"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestConnectionPage() {
  const { user, login, logout } = useAuthStore()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "student@example.com",
    password: "password123"
  })

  const testAPI = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:8000/health')
      results.health = {
        success: healthResponse.ok,
        status: healthResponse.status,
        data: await healthResponse.json()
      }
    } catch (error) {
      results.health = { success: false, error: error.message }
    }

    try {
      // Test jobs endpoint
      const jobsResponse = await api.jobs.list()
      results.jobs = {
        success: true,
        data: jobsResponse.data
      }
    } catch (error) {
      results.jobs = { success: false, error: error.message }
    }

    setTestResults(results)
    setLoading(false)
  }

  const handleLogin = async () => {
    try {
      await login(loginData.email, loginData.password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    testAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
              <Button onClick={testAPI} variant="secondary">
                Test API
              </Button>
            </div>

            {user && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Logged in as: {user.email} (Role: {user.role})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([key, result]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold capitalize">{key} Endpoint</span>
                  </div>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
