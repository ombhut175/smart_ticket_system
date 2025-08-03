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
  User as UserIcon,
  Crown,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Add these imports at the top
import { User, UserRole } from "@/types";
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SidebarNav } from "@/components/navigation/sidebar-nav"

interface ExtendedUser extends User {
  id: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  ticketCount: number;
}

// Add api-client import
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

// Remove mock data
//]

function RoleBadge({ role }: { role: UserRole }) {
  const getRoleConfig = (role: UserRole) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "admin":
        return { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Crown }
      case "moderator":
        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Shield }
      case "user":
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: UserIcon }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: UserIcon }
    }
  }

  const { color, icon: Icon } = getRoleConfig(role)

  return (
    <Badge className={`${color} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
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

function formatDate(dateString: string | null) {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function AdminUsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"role" | "status">("role")
  const [newRole, setNewRole] = useState<UserRole>("User")

  // State for users and loading
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const userData = await apiClient.getAllUsers();
        setUsers(userData.map((user: any) => ({
          ...user,
          name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login_at,
          ticketCount: 0 // Assuming you want to display ticket count, revise if you fetch this too
        })));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Early return if not authenticated or loading
  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user has admin role
  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === "Admin" || u.role === "admin").length,
    moderators: users.filter((u) => u.role === "Moderator" || u.role === "moderator").length,
    users: users.filter((u) => u.role === "User" || u.role === "user").length,
  }

  const handleRoleChange = (user: ExtendedUser) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setDialogType("role")
    setDialogOpen(true)
  }

  const handleStatusToggle = (user: ExtendedUser) => {
    setSelectedUser(user)
    setDialogType("status")
    setDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      
      if (dialogType === "role") {
        await apiClient.updateUserRole(selectedUser.id, newRole.toLowerCase())
      } else {
        await apiClient.toggleUserActive(selectedUser.id, !selectedUser.isActive)
      }
      
      // Refresh the users list
      const userData = await apiClient.getAllUsers()
      setUsers(userData.map((user: any) => ({
        ...user,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login_at,
        ticketCount: 0
      })))
      
      setDialogOpen(false)
      setSelectedUser(null)
    } catch (err) {
      console.error("Failed to update user:", err)
      alert("Failed to update user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <Header user={currentUser} variant="admin" />

      <div className="flex">
        <SidebarNav userRole={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} />

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
                      <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
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
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
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
              onClick={handleConfirmAction}
              disabled={loading}
              className={dialogType === "status" && selectedUser?.isActive ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {loading ? "Processing..." : (dialogType === "role" ? "Change Role" : selectedUser?.isActive ? "Deactivate" : "Activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
