"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Briefcase, Calendar, Globe, Link as LinkIcon, MapPin, PhoneCall, Plus, Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Company {
  id: number
  name: string
  website: string | null
  description: string | null
  sector: string | null
  hq_location: string | null
  point_of_contact: string | null
  created_at: string
}

export default function TpoCompaniesPage() {
  const { user } = useAuthStore()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [createFormData, setCreateFormData] = useState({
    name: "",
    sector: "",
    hq: "",
    website: "",
    poc: ""
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    sector: "",
    hq: "",
    website: "",
    poc: "",
    description: ""
  })

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.companies.list(sectorFilter || undefined)
      setCompanies(response.data || [])
    } catch (err: any) {
      console.error('Failed to load companies:', err)
      setError(err.response?.data?.detail || "Failed to load companies")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [sectorFilter])

  const handleCreateCompany = async () => {
    if (!createFormData.name) {
      setError("Company name is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const companyData = {
        name: createFormData.name,
        sector: createFormData.sector || null,
        hq_location: createFormData.hq || null,
        website: createFormData.website || null,
        point_of_contact: createFormData.poc || null,
        description: null
      }

      await api.companies.create(companyData)
      
      // Reset form and close dialog
      setCreateFormData({ name: "", sector: "", hq: "", website: "", poc: "" })
      setIsCreateDialogOpen(false)
      
      // Reload companies
      loadCompanies()
    } catch (err: any) {
      console.error('Failed to create company:', err)
      setError(err.response?.data?.detail || "Failed to create company")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCompany = async (company: Company) => {
    setEditingCompany(company)
    setEditFormData({
      name: company.name || "",
      sector: company.sector || "",
      hq: company.hq_location || "",
      website: company.website || "",
      poc: company.point_of_contact || "",
      description: company.description || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCompany = async () => {
    if (!editingCompany || !editFormData.name) {
      setError("Company name is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const companyData = {
        name: editFormData.name,
        sector: editFormData.sector || null,
        hq_location: editFormData.hq || null,
        website: editFormData.website || null,
        point_of_contact: editFormData.poc || null,
        description: editFormData.description || null
      }

      await api.companies.update(editingCompany.id, companyData)
      
      setIsEditDialogOpen(false)
      setEditingCompany(null)
      loadCompanies()
    } catch (err: any) {
      console.error('Failed to update company:', err)
      setError(err.response?.data?.detail || "Failed to update company")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return
    }

    try {
      await api.companies.delete(companyId)
      loadCompanies()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete company")
    }
  }

  const filteredCompanies = companies.filter(c => 
    searchTerm === "" || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.sector && c.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage hiring partners and campus relationships</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Company</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Company</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      placeholder="Company name" 
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Input 
                      placeholder="e.g. Software" 
                      value={createFormData.sector}
                      onChange={(e) => setCreateFormData({ ...createFormData, sector: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>HQ Location</Label>
                    <Input 
                      placeholder="City, Country" 
                      value={createFormData.hq}
                      onChange={(e) => setCreateFormData({ ...createFormData, hq: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Website</Label>
                    <Input 
                      placeholder="https://" 
                      value={createFormData.website}
                      onChange={(e) => setCreateFormData({ ...createFormData, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Point of Contact</Label>
                    <Input 
                      placeholder="Email or phone" 
                      value={createFormData.poc}
                      onChange={(e) => setCreateFormData({ ...createFormData, poc: e.target.value })}
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateCompany} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Company</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="Company name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Input 
                    placeholder="e.g. Software" 
                    value={editFormData.sector}
                    onChange={(e) => setEditFormData({ ...editFormData, sector: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>HQ Location</Label>
                  <Input 
                    placeholder="City, Country" 
                    value={editFormData.hq}
                    onChange={(e) => setEditFormData({ ...editFormData, hq: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input 
                    placeholder="https://" 
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Point of Contact</Label>
                  <Input 
                    placeholder="Email or phone" 
                    value={editFormData.poc}
                    onChange={(e) => setEditFormData({ ...editFormData, poc: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Company description" 
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting} onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingCompany(null)
                    setError(null)
                  }}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateCompany} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search company name, sector" 
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Sector</Label>
                  <Input 
                    placeholder="e.g. Software" 
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={loadCompanies}>Filter</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Partner Companies</CardTitle>
              <CardDescription>Track visits, contacts, and active drives</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading companies...</span>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || sectorFilter ? "No companies match your filters." : "No companies added yet. Add your first company above."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>HQ</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>PoC</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{c.name}</div>
                        </TableCell>
                        <TableCell>{c.sector || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {c.hq_location || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.website ? (
                            <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                              <Globe className="w-4 h-4" />Website
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PhoneCall className="w-4 h-4" />
                            {c.point_of_contact || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCompany(c)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCompany(c.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
