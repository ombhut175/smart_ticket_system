"use client"
import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  Ticket as TicketIcon,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/stores/auth-store"
import { Ticket } from "@/types"
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { deleteFetcher } from '@/lib/swr/fetchers'

export default function AdminTicketsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  const itemsPerPage = 20

  const listQuery = useMemo(() => {
    const params: Record<string, any> = { page: currentPage, limit: itemsPerPage }
    if (statusFilter !== 'all') params.status = statusFilter
    if (priorityFilter !== 'all') params.priority = priorityFilter
    if (assigneeFilter !== 'all') params.assigned_to = assigneeFilter === 'unassigned' ? '' : assigneeFilter
    const qs = new URLSearchParams(params).toString()
    return `/tickets/all?${qs}`
  }, [currentPage, statusFilter, priorityFilter, assigneeFilter])

  const { data: ticketsResp, isLoading: loading, mutate } = useSWR<{
    success: boolean;
    statusCode: number;
    message: string;
    data: Ticket[];
    meta: { total: number; page: number; limit: number };
    timestamp: string;
  }>(listQuery, {
    onError: () => toast({ title: 'Error', description: 'Failed to load tickets. Please try again.', variant: 'destructive' }),
    revalidateOnFocus: true,
  })

  useEffect(() => {
    if (ticketsResp) {
      setTickets(ticketsResp.data)
      setTotalTickets(ticketsResp.meta.total)
      setTotalPages(Math.ceil(ticketsResp.meta.total / itemsPerPage))
    }
  }, [ticketsResp])

  // Filter tickets by search term (client-side)
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.creator?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.assignee?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { trigger: deleteTicket } = useSWRMutation<string, any, string, void>(
    selectedTicket ? `/tickets/${selectedTicket.id}` : null,
    async (url: string) => deleteFetcher(url)
  )

  // Delete ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicket) return

    try {
      setDeleteLoading(true)
      await deleteTicket()
      toast({ title: 'Success', description: 'Ticket deleted successfully.' })
      setShowDeleteDialog(false)
      setSelectedTicket(null)
      await mutate() // Refresh the list
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete ticket. Please try again.', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      todo: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700", icon: Circle },
      in_progress: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", icon: Clock },
      waiting_for_customer: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800", icon: AlertTriangle },
      resolved: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle },
      closed: { color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: Circle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.todo
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1 font-medium text-xs border`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
      medium: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
      high: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium

    return (
      <Badge className={`${config.color} text-xs border font-medium`}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get unique assignees for filter
  const uniqueAssignees = Array.from(
    new Set(tickets.filter(t => t.assignee).map(t => t.assignee!.email))
  )

  // Statistics
  const stats = {
    total: totalTickets,
    open: tickets.filter(t => t.status === 'todo').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  // Early return if not authenticated or loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <Header user={user} variant="admin" />
      
      <div className="flex">
        <SidebarNav userRole="Admin" />
        
        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <BreadcrumbNav />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">All Tickets</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and monitor all support tickets in the system
                </p>
              </div>
              
              {/* Refresh now revalidates SWR cache */}
              <Button
                onClick={() => mutate()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                      <TicketIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            </div>

            {/* Filters and Search */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
                <CardDescription>Find and filter tickets by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All assignees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {uniqueAssignees.map((email) => (
                          <SelectItem key={email} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                        setAssigneeFilter("all")
                        setCurrentPage(1)
                      }}
                      className="w-full hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
                <CardDescription>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalTickets)} of {totalTickets} tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">Ticket</TableHead>
                        <TableHead className="font-semibold">Creator</TableHead>
                        <TableHead className="font-semibold">Assignee</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                        <TableHead className="font-semibold">Updated</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3">
                              <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading tickets...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center gap-4">
                              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                                <TicketIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">No tickets found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                            <TableCell>
                              <div className="space-y-1 max-w-xs">
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{ticket.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {ticket.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium">
                                    {ticket.creator?.email.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{ticket.creator?.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {ticket.assignee ? (
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium">
                                      {ticket.assignee.email.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{ticket.assignee.email}</span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-gray-500 border-gray-300">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {formatDate(ticket.created_at)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {formatDate(ticket.updated_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem asChild>
                                    <a href={`/tickets/${ticket.id}`} className="flex items-center">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`/moderator/tickets/${ticket.id}/edit`} className="flex items-center">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Ticket
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                    onClick={() => {
                                      setSelectedTicket(ticket)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Ticket
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Ticket
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
              {selectedTicket && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {selectedTicket.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Created by {selectedTicket.creator?.email}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteLoading}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTicket}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
