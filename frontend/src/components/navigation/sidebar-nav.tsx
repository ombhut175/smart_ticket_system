"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Shield,
  Crown,
  Settings,
  Users,
  UserPlus,
  TrendingUp,
  Ticket,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarNavProps {
  userRole: "Moderator" | "Admin"
  className?: string
}

export function SidebarNav({ userRole, className }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getNavigationItems = () => {
    switch (userRole) {
      case "Admin":
        return [
          {
            title: "User Management",
            href: "/admin/users",
            icon: Users,
            badge: null,
          },
          {
            title: "Promote Moderator",
            href: "/admin/moderators/new",
            icon: UserPlus,
            badge: null,
          },
          {
            title: "System Settings",
            href: "/admin/settings",
            icon: Settings,
            badge: null,
          },
        ]
      case "Moderator":
        return [
          {
            title: "Dashboard",
            href: "/moderator/dashboard",
            icon: Shield,
            badge: null,
          },
          {
            title: "All Tickets",
            href: "/moderator/tickets",
            icon: Ticket,
            badge: "12", // This would come from real data
          },
          {
            title: "Analytics",
            href: "/moderator/analytics",
            icon: TrendingUp,
            badge: null,
          },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()
  const roleConfig = {
    Admin: {
      icon: Crown,
      title: "Admin Portal",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    Moderator: {
      icon: Shield,
      title: "Moderator Portal",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
  }

  const config = roleConfig[userRole]
  const RoleIcon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${config.bgColor}`}>
              <RoleIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{config.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Navigation</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? `${config.color} ${config.bgColor}`
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
                  collapsed && "justify-center",
                )}
                title={collapsed ? item.title : undefined}
              >
                <ItemIcon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start bg-transparent">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                User Dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
