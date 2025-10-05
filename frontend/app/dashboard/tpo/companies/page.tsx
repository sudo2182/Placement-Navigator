"use client"

import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Briefcase, Calendar, Globe, Link as LinkIcon, MapPin, PhoneCall, Plus, Search } from "lucide-react"

const mockUser = { id: "3", name: "Mr. Rajesh Kumar", email: "tpo@example.com", role: "tpo" as const }

const initialCompanies = [
  { id: 1, name: "Microsoft", sector: "Software", hq: "Redmond, USA", website: "https://microsoft.com", poc: "microsoft-campus@microsoft.com", lastVisited: "2024-10-12", activeDrives: 3 },
  { id: 2, name: "Google", sector: "Internet", hq: "Mountain View, USA", website: "https://google.com", poc: "campus-hiring@google.com", lastVisited: "2024-09-01", activeDrives: 2 },
  { id: 3, name: "Amazon", sector: "E-commerce", hq: "Seattle, USA", website: "https://amazon.com", poc: "university-relations@amazon.com", lastVisited: "2024-08-24", activeDrives: 4 },
]

export default function TpoCompaniesPage() {
  return (
    <AppLayout user={mockUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage hiring partners and campus relationships</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Company</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Company</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Company name" defaultValue="Adobe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Input placeholder="e.g. Software" defaultValue="Software" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>HQ</Label>
                    <Input placeholder="City, Country" defaultValue="San Jose, USA" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Website</Label>
                    <Input placeholder="https://" defaultValue="https://adobe.com" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Point of Contact</Label>
                    <Input placeholder="Email or phone" defaultValue="adobe-campus@adobe.com" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Demo interface: saving does not persist data.</p>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search company name, sector" className="pl-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Sector</Label>
                  <Input placeholder="e.g. Software" />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">Filter</Button>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>HQ</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>PoC</TableHead>
                    <TableHead className="text-right">Active Drives</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialCompanies.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{c.name}</div>
                      </TableCell>
                      <TableCell>{c.sector}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.hq}</div></TableCell>
                      <TableCell>
                        <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600"><Globe className="w-4 h-4" />Website</a>
                      </TableCell>
                      <TableCell><div className="flex items-center gap-1"><PhoneCall className="w-4 h-4" />{c.poc}</div></TableCell>
                      <TableCell className="text-right">{c.activeDrives}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="p-4 text-center">
              <Badge variant="outline">Demo Interface</Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Hardcoded partner data to simulate realistic TPO workflows</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}