"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Search, Users, Settings, TrendingUp, Shield } from "lucide-react"
import { UserRole } from "@/types"

interface QuickActionsProps {
  userRole: UserRole
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getUserActions = () => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: "Manage Users",
            description: "View and manage all user accounts",
            href: "/admin/users",
            icon: Users,
            color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          },
          {
            title: "Promote Moderator",
            description: "Promote users to moderator role",
            href: "/admin/moderators/new",
            icon: Shield,
            color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
          },
          {
            title: "System Settings",
            description: "Configure system preferences",
            href: "/admin/settings",
            icon: Settings,
            color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
          },
        ]
      case "moderator":
        return [
          {
            title: "View All Tickets",
            description: "Manage and respond to tickets",
            href: "/moderator/dashboard",
            icon: Search,
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          },
          {
            title: "Analytics",
            description: "View ticket statistics and trends",
            href: "/moderator/dashboard",
            icon: TrendingUp,
            color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
          },
        ]
      default:
        return [
          {
            title: "Create New Ticket",
            description: "Submit a new support request",
            href: "/tickets/new",
            icon: Plus,
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          },
          {
            title: "View My Tickets",
            description: "Check status of your tickets",
            href: "/tickets",
            icon: Search,
            color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
          },
        ]
    }
  }

  const actions = getUserActions()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used features and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => {
            const IconComponent = action.icon
            return (
              <Button
                key={action.href}
                asChild
                variant="outline"
                className="h-auto p-4 justify-start bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-normal"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">{action.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{action.description}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
