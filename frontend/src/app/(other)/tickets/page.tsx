"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Filter, Search, Clock, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { ticketService } from "@/services/ticket.service"
import { Ticket, TicketQueryParams } from "@/types"
import { toast } from "sonner"
import { DashboardSkeleton } from "@/components/loading-skeleton"


function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "todo":
        return { color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", icon: Circle, label: "Open" }
      case "in_progress":
        return { color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800", icon: Clock, label: "In Progress" }
      case "waiting_for_customer":
        return { color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", icon: Circle, label: "Waiting for Customer" }
      case "resolved":
        return { color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800", icon: CheckCircle, label: "Resolved" }
      case "closed":
        return { color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800", icon: CheckCircle, label: "Closed" }
      case "cancelled":
        return { color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800", icon: Circle, label: "Cancelled" }
      default:
        return { color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700", icon: Circle, label: "Unknown" }
    }
  }

  const { color, icon: Icon, label } = getStatusConfig(status)

  return (
    <Badge className={`${color} border flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertCircle, label: "High" }
      case "medium":
        return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", icon: Clock, label: "Medium" }
      case "low":
        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Circle, label: "Low" }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Circle, label: "Unknown" }
    }
  }

  const { color, icon: Icon, label } = getPriorityConfig(priority)

  return (
    <Badge className={`${color} text-xs flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "1 day ago"
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
  return date.toLocaleDateString()
}

export default function TicketsPage() {
  const [mounted, setMounted] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load tickets from API
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const params: TicketQueryParams = {
          page: currentPage,
          limit: 20,
          ...(statusFilter !== "all" && { status: statusFilter as any }),
          ...(priorityFilter !== "all" && { priority: priorityFilter as any })
        }
        
        const response = await ticketService.getUserTickets(params)
        setTickets(response.data)
        setTotalPages(Math.ceil(response.meta.total / response.meta.limit))
      } catch (error) {
        console.error('Error loading tickets:', error)
        toast.error('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [user, currentPage, statusFilter, priorityFilter])

  if (!mounted || !user) return <DashboardSkeleton />

  // Filter tickets based on search query (client-side filtering for search)
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        {/* Header */}
        <Header user={user} variant="user" />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BreadcrumbNav />
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Tickets</h2>
              <p className="text-gray-600 dark:text-gray-400">View and manage all your support tickets</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/tickets/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter and search your tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="todo">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                        </TableRow>
                      ))
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          {tickets.length === 0 ? "No tickets found. Create your first ticket!" : "No tickets found matching your filters"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                          onClick={() => {
                            // Navigate to ticket detail page
                            console.log(`Navigate to ticket ${ticket.id}`)
                          }}
                        >
                          <TableCell className="font-mono text-sm">{ticket.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{ticket.title}</TableCell>
                          <TableCell>
                            <StatusBadge status={ticket.status} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={ticket.priority} />
                          </TableCell>
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {formatDate(ticket.updated_at)}
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
    </ProtectedRoute>
  )
}
