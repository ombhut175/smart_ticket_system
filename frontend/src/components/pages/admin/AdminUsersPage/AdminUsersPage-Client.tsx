"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Mail,
  Phone
} from "lucide-react"
import Link from "next/link"
import { USER_ROLES, USER_STATUSES } from "@/constants"
import { ROUTES } from "@/constants"

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user || user.role !== USER_ROLES.ADMIN) return null

  // Mock data - replace with actual API calls
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: USER_ROLES.USER,
      status: USER_STATUSES.ACTIVE,
      avatar: "/placeholder.svg",
      phone: "+1 (555) 123-4567",
      createdAt: "2024-01-15T10:30:00Z",
      lastLoginAt: "2024-01-20T14:20:00Z",
      totalTickets: 24,
      resolvedTickets: 18
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: USER_ROLES.MODERATOR,
      status: USER_STATUSES.ACTIVE,
      avatar: "/placeholder.svg",
      phone: "+1 (555) 234-5678",
      createdAt: "2024-01-10T11:20:00Z",
      lastLoginAt: "2024-01-19T09:15:00Z",
      totalTickets: 45,
      resolvedTickets: 42
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: USER_ROLES.ADMIN,
      status: USER_STATUSES.ACTIVE,
      avatar: "/placeholder.svg",
      phone: "+1 (555) 345-6789",
      createdAt: "2024-01-05T08:45:00Z",
      lastLoginAt: "2024-01-20T16:30:00Z",
      totalTickets: 67,
      resolvedTickets: 65
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: USER_ROLES.USER,
      status: USER_STATUSES.INACTIVE,
      avatar: "/placeholder.svg",
      phone: "+1 (555) 456-7890",
      createdAt: "2024-01-12T13:15:00Z",
      lastLoginAt: "2024-01-15T10:20:00Z",
      totalTickets: 12,
      resolvedTickets: 8
    }
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Admin</Badge>
      case USER_ROLES.MODERATOR:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Moderator</Badge>
      case USER_ROLES.USER:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case USER_STATUSES.ACTIVE:
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
      case USER_STATUSES.INACTIVE:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inactive</Badge>
      case USER_STATUSES.PENDING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case USER_STATUSES.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case USER_STATUSES.INACTIVE:
        return <XCircle className="h-4 w-4 text-red-500" />
      case USER_STATUSES.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase())
    const matchesRole = filters.role === "all" || user.role === filters.role
    const matchesStatus = filters.status === "all" || user.status === filters.status
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[filters.sortBy as keyof typeof a]
    const bValue = b[filters.sortBy as keyof typeof b]
    
    if (filters.sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    
    setIsLoading(true)
    try {
      // TODO: Implement delete API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("User deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and their permissions</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href={ROUTES.ADMIN.USERS.NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                <SelectItem value={USER_ROLES.MODERATOR}>Moderator</SelectItem>
                <SelectItem value={USER_ROLES.USER}>User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={USER_STATUSES.ACTIVE}>Active</SelectItem>
                <SelectItem value={USER_STATUSES.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={USER_STATUSES.PENDING}>Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="lastLoginAt">Last Login</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {sortedUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.role !== "all" || filters.status !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "No users have been created yet."}
              </p>
              <Button asChild>
                <Link href={ROUTES.ADMIN.USERS.NEW}>Add Your First User</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Tickets</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.totalTickets} / {user.resolvedTickets}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.ADMIN.USERS.DETAIL(user.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.ADMIN.USERS.EDIT(user.id)}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>User Summary</CardTitle>
          <CardDescription>Overview of user statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === USER_STATUSES.ACTIVE).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === USER_ROLES.MODERATOR).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Moderators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === USER_ROLES.ADMIN).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
