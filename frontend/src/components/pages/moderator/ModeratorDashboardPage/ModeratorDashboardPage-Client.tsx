"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  Ticket, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Plus,
  ArrowRight,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Eye,
  Edit
} from "lucide-react"
import Link from "next/link"
import { ROUTES, USER_ROLES, TICKET_STATUS, TICKET_PRIORITY } from "@/constants"

export default function ModeratorDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user || user.role !== USER_ROLES.MODERATOR) return null

  // Mock data - replace with actual API calls
  const stats = {
    totalTickets: 156,
    openTickets: 23,
    inProgressTickets: 45,
    resolvedTickets: 88,
    avgResponseTime: "2.3 hours",
    satisfactionRate: 94.2,
    ticketsThisWeek: 23,
    ticketsLastWeek: 18
  }

  const recentTickets = [
    {
      id: "T-001",
      title: "Login issue on mobile app",
      status: TICKET_STATUS.OPEN,
      priority: TICKET_PRIORITY.HIGH,
      requester: "John Doe",
      createdAt: "2024-01-20T10:30:00Z",
      category: "Authentication"
    },
    {
      id: "T-002",
      title: "Payment gateway error",
      status: TICKET_STATUS.IN_PROGRESS,
      priority: TICKET_PRIORITY.CRITICAL,
      requester: "Jane Smith",
      createdAt: "2024-01-20T09:15:00Z",
      category: "Payment"
    },
    {
      id: "T-003",
      title: "Feature request: Dark mode",
      status: TICKET_STATUS.RESOLVED,
      priority: TICKET_PRIORITY.LOW,
      requester: "Bob Johnson",
      createdAt: "2024-01-19T14:20:00Z",
      category: "Feature Request"
    },
    {
      id: "T-004",
      title: "API rate limiting",
      status: TICKET_STATUS.OPEN,
      priority: TICKET_PRIORITY.MEDIUM,
      requester: "Alice Brown",
      createdAt: "2024-01-19T11:45:00Z",
      category: "API"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case TICKET_STATUS.OPEN:
        return <Badge variant="destructive">Open</Badge>
      case TICKET_STATUS.IN_PROGRESS:
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>
      case TICKET_STATUS.RESOLVED:
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Resolved</Badge>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderator Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name || user.email}. Here's your ticket overview.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href={ROUTES.TICKETS.ROOT}>
            <Plus className="mr-2 h-4 w-4" />
            View All Tickets
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                +{stats.ticketsThisWeek - stats.ticketsLastWeek} this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.openTickets}</p>
              </div>
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                {stats.avgResponseTime} avg response
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressTickets}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <BarChart3 className="h-4 w-4 mr-1 text-blue-500" />
                {Math.round((stats.inProgressTickets / stats.totalTickets) * 100)}% of total
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolvedTickets}</p>
              </div>
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Zap className="h-4 w-4 mr-1 text-green-500" />
                {stats.satisfactionRate}% satisfaction
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Ticket Resolution Progress
            </CardTitle>
            <CardDescription>Current status of all assigned tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Open Tickets</span>
                <span className="font-medium">{stats.openTickets}</span>
              </div>
              <Progress value={(stats.openTickets / stats.totalTickets) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>In Progress</span>
                <span className="font-medium">{stats.inProgressTickets}</span>
              </div>
              <Progress value={(stats.inProgressTickets / stats.totalTickets) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Resolved</span>
                <span className="font-medium">{stats.resolvedTickets}</span>
              </div>
              <Progress value={(stats.resolvedTickets / stats.totalTickets) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Your moderation performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgResponseTime}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.satisfactionRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((stats.resolvedTickets / stats.totalTickets) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-500" />
            Recent Tickets
          </CardTitle>
          <CardDescription>Latest tickets that require your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 space-y-2">
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Requester: {ticket.requester}</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.TICKETS.DETAIL(ticket.id)}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.TICKETS.EDIT(ticket.id)}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.TICKETS.DETAIL(ticket.id)}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href={ROUTES.TICKETS.ROOT}>View All Tickets</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href={ROUTES.TICKETS.NEW}>
                <Plus className="h-6 w-6" />
                Create Ticket
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href={ROUTES.TICKETS.ROOT}>
                <Ticket className="h-6 w-6" />
                Manage Tickets
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href={ROUTES.USERS}>
                <Users className="h-6 w-6" />
                View Users
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
