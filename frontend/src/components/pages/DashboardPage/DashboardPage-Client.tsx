"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/stores/auth-store"
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
  Zap
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Mock data - replace with actual API calls
  const stats = {
    totalTickets: 156,
    openTickets: 23,
    resolvedTickets: 128,
    pendingTickets: 5,
    totalUsers: 89,
    activeUsers: 67,
    responseTime: "2.3h",
    satisfactionRate: 94.2
  }

  const recentTickets = [
    { id: "T-001", title: "Login issue on mobile app", status: "open", priority: "high", createdAt: "2 hours ago" },
    { id: "T-002", title: "Payment gateway error", status: "pending", priority: "critical", createdAt: "4 hours ago" },
    { id: "T-003", title: "Feature request: Dark mode", status: "resolved", priority: "low", createdAt: "1 day ago" },
    { id: "T-004", title: "API rate limiting", status: "open", priority: "medium", createdAt: "1 day ago" }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "resolved":
        return <Badge variant="default">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Critical</Badge>
      case "high":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">High</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>
      case "low":
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || user?.email}! Here's what's happening today.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openTickets}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="text-orange-600 dark:text-orange-400">+5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.responseTime}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">-15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.satisfactionRate}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Ticket Resolution Progress
            </CardTitle>
            <CardDescription>Current month ticket resolution rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resolved</span>
                <span className="font-medium">{stats.resolvedTickets}</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium">{stats.pendingTickets}</span>
              </div>
              <Progress value={3} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Open</span>
                <span className="font-medium">{stats.openTickets}</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              User Activity
            </CardTitle>
            <CardDescription>Active users and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users</span>
                <span className="font-medium">{stats.activeUsers}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Users</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>High engagement this week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest support tickets and their status</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tickets">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Ticket className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">{ticket.createdAt}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/tickets/new">
                <Plus className="h-6 w-6" />
                Create Ticket
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/tickets">
                <Ticket className="h-6 w-6" />
                View Tickets
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/profile">
                <Users className="h-6 w-6" />
                Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
