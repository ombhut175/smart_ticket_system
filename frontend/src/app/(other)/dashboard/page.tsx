"use client"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, Easing, Variants } from "framer-motion"
import { Plus, Clock, User as UserIcon, CheckCircle, AlertCircle, Circle, TrendingUp, Zap, Star } from "lucide-react"
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { QuickActions } from "@/components/navigation/quick-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Ticket } from "@/types"
import { useAuth } from "@/stores/auth-store"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { toast } from "sonner"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import useSWR from 'swr'

interface ExtendedUser extends User {
  profileComplete: boolean;
  memberSince: string;
  totalTickets: number;
  resolvedTickets: number;
}


function StatusBadge({ status, urgency }: { status: string; urgency?: string }): JSX.Element {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "todo":
        return {
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          icon: Circle,
          pulse: urgency === "critical",
          label: "Open",
        }
      case "in_progress":
        return {
          color:
            "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
          icon: Clock,
          pulse: false,
          label: "In Progress",
        }
      case "waiting_for_customer":
        return {
          color:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          icon: Circle,
          pulse: false,
          label: "Waiting for Customer",
        }
      case "resolved":
        return {
          color:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
          icon: CheckCircle,
          pulse: false,
          label: "Resolved",
        }
      case "closed":
        return {
          color:
            "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
          icon: CheckCircle,
          pulse: false,
          label: "Closed",
        }
      case "cancelled":
        return {
          color:
            "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
          icon: Circle,
          pulse: false,
          label: "Cancelled",
        }
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          icon: Circle,
          pulse: false,
          label: "Unknown",
        }
    }
  }

  const { color, icon: Icon, pulse, label } = getStatusConfig(status)

  return (
    <Badge className={`${color} border ${pulse ? "animate-pulse" : ""} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }): JSX.Element {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          icon: AlertCircle,
          label: "High",
        }
      case "medium":
        return {
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
          icon: Clock,
          label: "Medium",
        }
      case "low":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          icon: Circle,
          label: "Low",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: Circle,
          label: "Unknown",
        }
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as Easing,
    },
  },
}

const ticketVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as Easing,
    },
  }),
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user's tickets via SWR
  const { data: recentTicketsResp, isLoading: recentLoading } = useSWR<{
    success: boolean;
    statusCode: number;
    message: string;
    data: Ticket[];
    meta: { total: number; page: number; limit: number };
    timestamp: string;
  }>(user ? '/tickets?page=1&limit=5' : null, {
    revalidateOnFocus: true,
    onError: () => toast.error('Failed to load tickets')
  })

  useEffect(() => {
    setTicketsLoading(recentLoading)
    if (recentTicketsResp?.data) {
      setTickets(recentTicketsResp.data)
    }
  }, [recentLoading, recentTicketsResp])

  if (!mounted || !user) return <DashboardSkeleton />

  // Calculate stats based on loaded tickets
  const stats = [
    {
      label: "Total Tickets",
      value: tickets.length,
      change: "+12%",
      trend: "up",
      icon: Circle,
      color: "blue",
    },
    {
      label: "Open",
      value: tickets.filter((t) => t.status === "todo").length,
      change: "-8%",
      trend: "down",
      icon: Circle,
      color: "red",
    },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "in_progress").length,
      change: "+25%",
      trend: "up",
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "resolved").length,
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      color: "green",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
        {/* Header */}
        <Header user={user} variant="user" />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BreadcrumbNav />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Welcome Hero Section */}
          <motion.div variants={itemVariants} className="relative overflow-hidden">
            <Card className="border-0 shadow-2xl gradient-bg">
              <CardContent className="p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Welcome back, <span className="text-yellow-300">{user.name?.split(" ")[0] || user.first_name || user.email.split('@')[0]}</span>!
                      </h1>
                      <p className="text-xl text-blue-100 leading-relaxed">
                        Manage your support tickets and track their progress with our intelligent dashboard
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="flex flex-wrap gap-4"
                    >
                      <Button size="lg" className="glass text-white border-white/20 hover:bg-white/10" asChild>
                        <Link href="/tickets/new">
                          <Plus className="h-5 w-5 mr-2" />
                          Create New Ticket
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                        asChild
                      >
                        <Link href="/tickets">View All Tickets</Link>
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ring-4 ring-white/20">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.email} />
                            <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                              {user.name
                                ? user.name.split(" ").map((n) => n[0]).join("")
                                : user.first_name && user.last_name
                                ? `${user.first_name[0]}${user.last_name[0]}`
                                : user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-semibold text-lg">{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}</h3>
                          <p className="text-blue-100 text-sm">Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold text-white">{tickets.length}</div>
                          <div className="text-blue-100 text-xs">Total Tickets</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-2xl font-bold text-green-300">{tickets.filter(t => t.status === 'resolved').length}</div>
                          <div className="text-blue-100 text-xs">Resolved</div>
                        </div>
                      </div>
                    </div>

                    {/* Floating elements */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg"
                    >
                      <Star className="h-6 w-6 text-yellow-800" />
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
                      className="absolute -bottom-4 -left-4 bg-green-400 rounded-full p-3 shadow-lg"
                    >
                      <Zap className="h-6 w-6 text-green-800" />
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <motion.div key={stat.label} variants={itemVariants} custom={index}>
                        <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105">
                          <CardContent className="p-6">
                            <div
                              className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20 mb-4`}
                            >
                              <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</div>
                            <div
                              className={`text-xs flex items-center justify-center gap-1 ${
                                stat.trend === "up"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              <TrendingUp className={`h-3 w-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                              {stat.change}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Recent Tickets */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Recent Tickets
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/tickets">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ticketsLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <AnimatePresence>
                          {tickets.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              variants={ticketVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              custom={index}
                              layout
                            >
                              <Card className="glass border border-gray-200 dark:border-gray-700 cursor-pointer">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                          {ticket.id.slice(0, 8)}
                                        </span>
                                        <PriorityBadge priority={ticket.priority} />
                                      </div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                                        {ticket.title}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {new Date(ticket.updated_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 ring-2 ring-blue-100 dark:ring-blue-900">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.email} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold">
                          {user.name
                            ? user.name.split(" ").map((n) => n[0]).join("")
                            : user.first_name && user.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`
                            : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {user.is_active ? 'Active Member' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    {!user.is_profile_completed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Complete Your Profile</h5>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Add more details to help us provide better support
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/30 bg-transparent"
                            >
                              Complete Profile
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <QuickActions userRole={user.role} />
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Total Tickets", value: tickets.length, color: "blue" },
                      { label: "Open", value: tickets.filter((t) => t.status === "todo").length, color: "red" },
                      {
                        label: "In Progress",
                        value: tickets.filter((t) => t.status === "in_progress").length,
                        color: "yellow",
                      },
                      {
                        label: "Resolved",
                        value: tickets.filter((t) => t.status === "resolved").length,
                        color: "green",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</span>
                        <Badge className="font-bold">{stat.value}</Badge>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  </ProtectedRoute>
  )
}
