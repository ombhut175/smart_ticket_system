"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User,
  Crown,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Add these imports at the top
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SidebarNav } from "@/components/navigation/sidebar-nav"

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "User",
    isActive: true,
    createdAt: "2024-01-10T09:15:00Z",
    lastLogin: "2024-01-15T14:30:00Z",
    ticketCount: 5,
  },
  {
    id: "2",
    email: "sarah.wilson@company.com",
    name: "Sarah Wilson",
    role: "Moderator",
    isActive: true,
    createdAt: "2023-12-01T10:00:00Z",
    lastLogin: "2024-01-15T16:45:00Z",
    ticketCount: 23,
  },
  {
    id: "3",
    email: "mike.johnson@company.com",
    name: "Mike Johnson",
    role: "Moderator",
    isActive: true,
    createdAt: "2023-11-15T11:20:00Z",
    lastLogin: "2024-01-15T12:20:00Z",
    ticketCount: 18,
  },
  {
    id: "4",
    email: "alice.smith@example.com",
    name: "Alice Smith",
    role: "User",
    isActive: false,
    createdAt: "2024-01-05T15:45:00Z",
    lastLogin: "2024-01-12T09:30:00Z",
    ticketCount: 2,
  },
  {
    id: "5",
    email: "admin@company.com",
    name: "System Admin",
    role: "Admin",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    lastLogin: "2024-01-15T17:00:00Z",
    ticketCount: 0,
  },
]

const mockAdmin = {
  name: "System Admin",
  email: "admin@company.com",
  role: "Admin",
  avatar: "",
}

function RoleBadge({ role }: { role: string }) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "Admin":
        return { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Crown }
      case "Moderator":
        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Shield }
      case "User":
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: User }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: User }
    }
  }

  const { color, icon: Icon } = getRoleConfig(role)

  return (
    <Badge className={`${color} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {role}
    </Badge>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={`flex items-center gap-1 font-medium ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"role" | "status">("role")
  const [newRole, setNewRole] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Filter users based on search
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.isActive).length,
    admins: mockUsers.filter((u) => u.role === "Admin").length,
    moderators: mockUsers.filter((u) => u.role === "Moderator").length,
    users: mockUsers.filter((u) => u.role === "User").length,
  }

  const handleRoleChange = (user: any) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setDialogType("role")
    setDialogOpen(true)
  }

  const handleStatusToggle = (user: any) => {
    setSelectedUser(user)
    setDialogType("status")
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <Header user={mockAdmin} variant="admin" />

      <div className="flex">
        <SidebarNav userRole="Admin" />

        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <BreadcrumbNav />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage user accounts, roles, and permissions</p>
              </div>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/admin/moderators/new">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Promote Moderator
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                    </div>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</p>
                    </div>
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                      <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moderators</p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.moderators}</p>
                    </div>
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/20 p-3">
                      <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Regular Users</p>
                      <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.users}</p>
                    </div>
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                      <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Users
                </CardTitle>
                <CardDescription>Find users by name, email, or role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Tickets</TableHead>
                        <TableHead className="font-semibold">Last Login</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found matching your search
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge isActive={user.isActive} />
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {user.ticketCount} tickets
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                              {formatDate(user.lastLogin)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                                    {user.isActive ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Activate User
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogType === "role" ? "Change User Role" : "Toggle User Status"}</DialogTitle>
            <DialogDescription>
              {dialogType === "role"
                ? `Change the role for ${selectedUser?.name}. This will affect their permissions in the system.`
                : `${selectedUser?.isActive ? "Deactivate" : "Activate"} ${selectedUser?.name}? This will ${selectedUser?.isActive ? "prevent" : "allow"} them from accessing the system.`}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "role" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle the action here
                console.log(
                  dialogType === "role" ? `Change role to ${newRole}` : `Toggle status for ${selectedUser?.name}`,
                )
                setDialogOpen(false)
              }}
              className={dialogType === "status" && selectedUser?.isActive ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {dialogType === "role" ? "Change Role" : selectedUser?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
