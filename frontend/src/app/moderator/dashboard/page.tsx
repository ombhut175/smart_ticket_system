"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  UserCheck,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  Ticket,
} from "lucide-react"

// Add these imports at the top
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SidebarNav } from "@/components/navigation/sidebar-nav"

// Mock data for demonstration
const mockTickets = [
  {
    id: "TK-001",
    title: "Login issues with mobile app",
    submitter: "john.doe@example.com",
    submitterName: "John Doe",
    status: "Open",
    priority: "High",
    assignedTo: "sarah.wilson@company.com",
    assignedName: "Sarah Wilson",
    lastUpdated: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-14T09:15:00Z",
  },
  {
    id: "TK-002",
    title: "Feature request: Dark mode support",
    submitter: "alice.smith@example.com",
    submitterName: "Alice Smith",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "mike.johnson@company.com",
    assignedName: "Mike Johnson",
    lastUpdated: "2024-01-14T16:45:00Z",
    createdAt: "2024-01-13T11:20:00Z",
  },
  {
    id: "TK-003",
    title: "Payment processing error on checkout",
    submitter: "bob.brown@example.com",
    submitterName: "Bob Brown",
    status: "Resolved",
    priority: "High",
    assignedTo: "sarah.wilson@company.com",
    assignedName: "Sarah Wilson",
    lastUpdated: "2024-01-12T14:20:00Z",
    createdAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "TK-004",
    title: "Account verification help needed",
    submitter: "emma.davis@example.com",
    submitterName: "Emma Davis",
    status: "Open",
    priority: "Low",
    assignedTo: null,
    assignedName: null,
    lastUpdated: "2024-01-10T09:15:00Z",
    createdAt: "2024-01-09T15:45:00Z",
  },
  {
    id: "TK-005",
    title: "Data export functionality request",
    submitter: "chris.wilson@example.com",
    submitterName: "Chris Wilson",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "mike.johnson@company.com",
    assignedName: "Mike Johnson",
    lastUpdated: "2024-01-08T11:30:00Z",
    createdAt: "2024-01-07T13:20:00Z",
  },
]

const mockModerators = [
  { email: "sarah.wilson@company.com", name: "Sarah Wilson" },
  { email: "mike.johnson@company.com", name: "Mike Johnson" },
  { email: "lisa.garcia@company.com", name: "Lisa Garcia" },
]

const mockUser = {
  name: "Sarah Wilson",
  email: "sarah.wilson@company.com",
  role: "Moderator",
  avatar: "",
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Open":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: Circle }
      case "In Progress":
        return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock }
      case "Resolved":
        return { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Circle }
    }
  }

  const { color, icon: Icon } = getStatusConfig(status)

  return (
    <Badge className={`${color} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      case "Medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800"
      case "Low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  return <Badge className={`${getPriorityColor(priority)} text-xs border`}>{priority}</Badge>
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "1d ago"
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}

export default function ModeratorDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assignedFilter, setAssignedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Filter tickets based on current filters
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesAssigned =
      assignedFilter === "all" ||
      (assignedFilter === "unassigned" && !ticket.assignedTo) ||
      (assignedFilter !== "unassigned" && ticket.assignedTo === assignedFilter)
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.submitterName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesPriority && matchesAssigned && matchesSearch
  })

  const stats = {
    total: mockTickets.length,
    open: mockTickets.filter((t) => t.status === "Open").length,
    inProgress: mockTickets.filter((t) => t.status === "In Progress").length,
    resolved: mockTickets.filter((t) => t.status === "Resolved").length,
    unassigned: mockTickets.filter((t) => !t.assignedTo).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900/20">
      {/* Header */}
      <Header user={mockUser} variant="moderator" />

      <div className="flex">
        <SidebarNav userRole="Moderator" />

        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <BreadcrumbNav />
            {/* Page Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage all support tickets across the system
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                      <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.open}</p>
                    </div>
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                      <Circle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</p>
                    </div>
                    <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unassigned</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.unassigned}</p>
                    </div>
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
                <CardDescription>Filter and search tickets to find what you need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigned To</label>
                    <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Assignments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignments</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {mockModerators.map((mod) => (
                          <SelectItem key={mod.email} value={mod.email}>
                            {mod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
                <CardDescription>Manage and track all support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Submitter</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Assigned To</TableHead>
                        <TableHead className="font-semibold">Updated</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No tickets found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow
                            key={ticket.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                          >
                            <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                            <TableCell className="font-medium max-w-xs truncate">{ticket.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800">
                                    {ticket.submitterName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{ticket.submitterName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={ticket.priority} />
                            </TableCell>
                            <TableCell>
                              {ticket.assignedTo ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                      {ticket.assignedName
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{ticket.assignedName}</span>
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                >
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                              {formatDate(ticket.lastUpdated)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Add Comment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Assign to Me
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
    </div>
  )
}
