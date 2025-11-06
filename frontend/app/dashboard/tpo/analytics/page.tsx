"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { BarChart3, TrendingUp, Users, Briefcase, Building2, FileText, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TpoAnalyticsPage() {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState<any>(null)
  const [jobAnalytics, setJobAnalytics] = useState<any>(null)
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null)
  const [companyAnalytics, setCompanyAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [overviewRes, jobsRes, studentsRes, companiesRes] = await Promise.all([
        api.analytics.tpo.overview().catch(() => ({ data: {} })),
        api.analytics.tpo.jobs().catch(() => ({ data: {} })),
        api.analytics.tpo.students().catch(() => ({ data: {} })),
        api.analytics.tpo.companies().catch(() => ({ data: {} }))
      ])
      
      setOverview(overviewRes.data || {})
      setJobAnalytics(jobsRes.data || {})
      setStudentAnalytics(studentsRes.data || {})
      setCompanyAnalytics(companiesRes.data || {})
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
      setError(err.response?.data?.detail || "Failed to load analytics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

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

  if (isLoading) {
    return (
      <AppLayout user={displayUser}>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={displayUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Overview Stats */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.total_jobs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {overview.active_jobs || 0} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.total_applications || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {overview.recent_applications || 0} in last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.total_companies || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Jobs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.recent_jobs || 0}</div>
                  <p className="text-xs text-muted-foreground">Posted in last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Job Analytics */}
          {jobAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Job Posting Analytics</CardTitle>
                <CardDescription>Overview of job postings and applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{jobAnalytics.total_jobs || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{jobAnalytics.active_jobs || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive Jobs</p>
                    <p className="text-2xl font-bold">{jobAnalytics.inactive_jobs || 0}</p>
                  </div>
                </div>
                {jobAnalytics.jobs_by_type && Object.keys(jobAnalytics.jobs_by_type).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Jobs by Type</p>
                    <div className="space-y-2">
                      {Object.entries(jobAnalytics.jobs_by_type).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Student Analytics */}
          {studentAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Student Analytics</CardTitle>
                <CardDescription>Student engagement and application statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{studentAnalytics.total_students || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">With Applications</p>
                    <p className="text-2xl font-bold">{studentAnalytics.students_with_applications || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Without Applications</p>
                    <p className="text-2xl font-bold">{studentAnalytics.students_without_applications || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{studentAnalytics.average_applications_per_student || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Analytics */}
          {companyAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Company Analytics</CardTitle>
                <CardDescription>Partner company engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Total Companies</p>
                  <p className="text-2xl font-bold">{companyAnalytics.total_companies || 0}</p>
                </div>
                {companyAnalytics.companies_by_sector && Object.keys(companyAnalytics.companies_by_sector).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Companies by Sector</p>
                    <div className="space-y-2">
                      {Object.entries(companyAnalytics.companies_by_sector).map(([sector, count]: [string, any]) => (
                        <div key={sector} className="flex justify-between">
                          <span className="text-sm">{sector}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

