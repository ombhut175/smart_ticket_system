"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  Loader2,
  Shield,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar
} from "lucide-react"
import Link from "next/link"

export default function AdminModeratorsNewPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "moderator",
    permissions: {
      viewTickets: true,
      editTickets: true,
      deleteTickets: false,
      assignTickets: true,
      viewUsers: true,
      editUsers: false,
      deleteUsers: false,
      viewReports: true,
      generateReports: true
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user || user.role !== "admin") return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement moderator creation API call
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      toast.success("Moderator created successfully!")
      router.push("/admin/users")
    } catch (error) {
      toast.error("Failed to create moderator. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "viewTickets":
        return "👁️"
      case "editTickets":
        return "✏️"
      case "deleteTickets":
        return "🗑️"
      case "assignTickets":
        return "📋"
      case "viewUsers":
        return "👥"
      case "editUsers":
        return "✏️"
      case "deleteUsers":
        return "🗑️"
      case "viewReports":
        return "📊"
      case "generateReports":
        return "📈"
      default:
        return "⚙️"
    }
  }

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case "viewTickets":
        return "View Tickets"
      case "editTickets":
        return "Edit Tickets"
      case "deleteTickets":
        return "Delete Tickets"
      case "assignTickets":
        return "Assign Tickets"
      case "viewUsers":
        return "View Users"
      case "editUsers":
        return "Edit Users"
      case "deleteUsers":
        return "Delete Users"
      case "viewReports":
        return "View Reports"
      case "generateReports":
        return "Generate Reports"
      default:
        return permission
    }
  }

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case "viewTickets":
        return "Can view all tickets in the system"
      case "editTickets":
        return "Can modify ticket details and status"
      case "deleteTickets":
        return "Can permanently remove tickets"
      case "assignTickets":
        return "Can assign tickets to other users"
      case "viewUsers":
        return "Can view user profiles and information"
      case "editUsers":
        return "Can modify user details and settings"
      case "deleteUsers":
        return "Can deactivate user accounts"
      case "viewReports":
        return "Can access system reports and analytics"
      case "generateReports":
        return "Can create custom reports and exports"
      default:
        return "System permission"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Moderator</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new moderator account with specific permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                Moderator Information
              </CardTitle>
              <CardDescription>Enter the basic information for the new moderator</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Department and Role */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department & Role</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="senior_moderator">Senior Moderator</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Moderator...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Create Moderator
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Permissions
              </CardTitle>
              <CardDescription>Configure what this moderator can access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.permissions).map(([permission, enabled]) => (
                <div key={permission} className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPermissionIcon(permission)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-900 dark:text-white">
                          {getPermissionLabel(permission)}
                        </Label>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getPermissionDescription(permission)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Moderator:</strong> Can manage tickets and view users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Senior Moderator:</strong> Additional reporting capabilities
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Team Lead:</strong> Can manage other moderators
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <UserPlus className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/tickets">
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
