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
  Ticket, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Circle,
  User,
  Calendar,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { USER_ROLES, TICKET_STATUS, TICKET_PRIORITY, TICKET_CATEGORIES } from "@/constants"
import { ROUTES } from "@/constants"

export default function AdminTicketsPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    category: "all",
    assignedTo: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user || user.role !== USER_ROLES.ADMIN) return null

  // Mock data - replace with actual API calls
  const tickets = [
    {
      id: "T-001",
      title: "Login issue on mobile app",
      description: "Unable to login to the mobile application. Getting error message 'Invalid credentials'.",
      status: TICKET_STATUS.OPEN,
      priority: TICKET_PRIORITY.HIGH,
      category: "Authentication",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      assignedTo: "Support Team",
      requester: {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/placeholder.svg"
      },
      messages: 3,
      lastActivity: "2024-01-15T14:20:00Z"
    },
    {
      id: "T-002",
      title: "Payment gateway error",
      description: "Payment processing is failing with error code 500. Users cannot complete transactions.",
      status: TICKET_STATUS.PENDING,
      priority: TICKET_PRIORITY.CRITICAL,
      category: "Payment",
      createdAt: "2024-01-14T15:45:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      assignedTo: "Dev Team",
      requester: {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "/placeholder.svg"
      },
      messages: 5,
      lastActivity: "2024-01-15T09:15:00Z"
    },
    {
      id: "T-003",
      title: "Feature request: Dark mode",
      description: "Would like to have a dark mode option for better user experience in low-light environments.",
      status: TICKET_STATUS.RESOLVED,
      priority: TICKET_PRIORITY.LOW,
      category: "Feature Request",
      createdAt: "2024-01-10T11:20:00Z",
      updatedAt: "2024-01-12T16:30:00Z",
      assignedTo: "Product Team",
      requester: {
        id: "3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        avatar: "/placeholder.svg"
      },
      messages: 8,
      lastActivity: "2024-01-12T16:30:00Z"
    },
    {
      id: "T-004",
      title: "API rate limiting",
      description: "API calls are being rate limited too aggressively. Need to adjust the limits.",
      status: TICKET_STATUS.IN_PROGRESS,
      priority: TICKET_PRIORITY.MEDIUM,
      category: "API",
      createdAt: "2024-01-13T08:45:00Z",
      updatedAt: "2024-01-14T12:10:00Z",
      assignedTo: "Backend Team",
      requester: {
        id: "4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        avatar: "/placeholder.svg"
      },
      messages: 12,
      lastActivity: "2024-01-14T12:10:00Z"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case TICKET_STATUS.OPEN:
        return <Badge variant="destructive">Open</Badge>
      case TICKET_STATUS.PENDING:
        return <Badge variant="secondary">Pending</Badge>
      case TICKET_STATUS.IN_PROGRESS:
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>
      case TICKET_STATUS.RESOLVED:
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Resolved</Badge>
      case TICKET_STATUS.CLOSED:
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case TICKET_PRIORITY.CRITICAL:
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Critical</Badge>
      case TICKET_PRIORITY.HIGH:
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">High</Badge>
      case TICKET_PRIORITY.MEDIUM:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>
      case TICKET_PRIORITY.LOW:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TICKET_STATUS.OPEN:
        return <Circle className="h-4 w-4 text-red-500" />
      case TICKET_STATUS.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />
      case TICKET_STATUS.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-blue-500" />
      case TICKET_STATUS.RESOLVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case TICKET_STATUS.CLOSED:
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === "all" || ticket.status === filters.status
    const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority
    const matchesCategory = filters.category === "all" || ticket.category === filters.category
    const matchesAssignedTo = filters.assignedTo === "all" || ticket.assignedTo === filters.assignedTo
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignedTo
  })

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aValue = a[filters.sortBy as keyof typeof a]
    const bValue = b[filters.sortBy as keyof typeof b]
    
    if (filters.sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return
    
    setIsLoading(true)
    try {
      // TODO: Implement delete API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Ticket deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete ticket")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage all system tickets</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TICKET_STATUS.OPEN}>Open</SelectItem>
                <SelectItem value={TICKET_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={TICKET_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TICKET_STATUS.RESOLVED}>Resolved</SelectItem>
                <SelectItem value={TICKET_STATUS.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TICKET_PRIORITY.CRITICAL}>Critical</SelectItem>
                <SelectItem value={TICKET_PRIORITY.HIGH}>High</SelectItem>
                <SelectItem value={TICKET_PRIORITY.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TICKET_PRIORITY.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.TECHNICAL}>Technical Issue</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.BILLING}>Billing & Payment</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.FEATURE}>Feature Request</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.BUG}>Bug Report</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.ACCOUNT}>Account & Access</SelectItem>
                <SelectItem value={TICKET_CATEGORIES.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.assignedTo} onValueChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Support Team">Support Team</SelectItem>
                <SelectItem value="Dev Team">Dev Team</SelectItem>
                <SelectItem value="Product Team">Product Team</SelectItem>
                <SelectItem value="Backend Team">Backend Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))}
            >
              {filters.sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {sortedTickets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tickets found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.status !== "all" || filters.priority !== "all" || filters.category !== "all" || filters.assignedTo !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "No tickets have been created yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {ticket.id}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {ticket.category}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {ticket.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Assigned to: {ticket.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.messages} messages</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ticket.requester.avatar} alt={ticket.requester.name} />
                          <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">
                            {ticket.requester.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium text-gray-900 dark:text-white">{ticket.requester.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{ticket.requester.email}</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.ADMIN.TICKETS.DETAIL(ticket.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.ADMIN.TICKETS.EDIT(ticket.id)}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTicket(ticket.id)}
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
          <CardTitle>Ticket Summary</CardTitle>
          <CardDescription>Overview of ticket statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tickets.filter(t => t.status === "open").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === "resolved").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
