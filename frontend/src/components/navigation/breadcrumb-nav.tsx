"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Custom labels for specific routes
      const labelMap: Record<string, string> = {
        dashboard: "Dashboard",
        tickets: "Tickets",
        new: "New Ticket",
        moderator: "Moderator",
        admin: "Admin",
        users: "User Management",
        moderators: "Moderators",
        login: "Login",
        signup: "Sign Up",
        "forgot-password": "Forgot Password",
        analytics: "Analytics",
        settings: "Settings",
        profile: "Profile",
      }

      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      // Don't make the last item clickable
      const href = index === segments.length - 1 ? undefined : currentPath

      breadcrumbs.push({ label, href })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Don't show breadcrumbs on auth pages or home page
  if (
    pathname === "/" ||
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/forgot-password")
  ) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
