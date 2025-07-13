"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Ticket,
  Shield,
  Crown,
  User,
  Settings,
  LogOut,
  Menu,
  Plus,
  Users,
  UserPlus,
  TrendingUp,
  Home,
} from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    email: string
    role: "User" | "Moderator" | "Admin"
    avatar?: string
  }
  variant?: "user" | "moderator" | "admin"
}

export function Header({ user, variant = "user" }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getVariantConfig = () => {
    switch (variant) {
      case "moderator":
        return {
          icon: Shield,
          title: "Moderator Portal",
          color: "text-indigo-600 dark:text-indigo-400",
          badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
          homeHref: "/moderator/dashboard",
        }
      case "admin":
        return {
          icon: Crown,
          title: "Admin Portal",
          color: "text-purple-600 dark:text-purple-400",
          badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
          homeHref: "/admin/users",
        }
      default:
        return {
          icon: Ticket,
          title: "Smart Ticket",
          color: "text-blue-600 dark:text-blue-400",
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          homeHref: "/dashboard",
        }
    }
  }

  const config = getVariantConfig()
  const IconComponent = config.icon

  const getNavigationLinks = () => {
    switch (variant) {
      case "moderator":
        return [
          { href: "/moderator/dashboard", label: "Dashboard", icon: Shield },
          { href: "/moderator/tickets", label: "All Tickets", icon: Ticket },
          { href: "/moderator/analytics", label: "Analytics", icon: TrendingUp },
        ]
      case "admin":
        return [
          { href: "/admin/users", label: "User Management", icon: Users },
          { href: "/admin/moderators/new", label: "Promote Moderator", icon: UserPlus },
        ]
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/tickets", label: "My Tickets", icon: Ticket },
          { href: "/tickets/new", label: "New Ticket", icon: Plus },
        ]
    }
  }

  const navigationLinks = getNavigationLinks()

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true
    if (href === "/tickets" && pathname === "/tickets") return true
    if (href === "/tickets/new" && pathname === "/tickets/new") return true
    if (href.startsWith("/moderator") && pathname.startsWith("/moderator")) {
      return pathname === href
    }
    if (href.startsWith("/admin") && pathname.startsWith("/admin")) {
      return pathname === href
    }
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href={config.homeHref} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <IconComponent className={`h-8 w-8 ${config.color}`} />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Smart Ticket System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => {
              const LinkIcon = link.icon
              const isActive = isActiveLink(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${config.color} bg-opacity-10 ${config.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-")}/10`
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-4 pb-6 border-b">
                    <IconComponent className={`h-8 w-8 ${config.color}`} />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{config.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Navigation Menu</p>
                    </div>
                  </div>

                  <nav className="flex-1 py-6">
                    <div className="space-y-2">
                      {navigationLinks.map((link) => {
                        const LinkIcon = link.icon
                        const isActive = isActiveLink(link.href)
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? `${config.color} bg-opacity-10 ${config.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-")}/10`
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <LinkIcon className="h-5 w-5" />
                            {link.label}
                          </Link>
                        )
                      })}
                    </div>
                  </nav>

                  {/* Mobile User Info */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className={config.badgeColor}>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <Badge className={`mt-1 ${config.badgeColor}`}>{user.role}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className={config.badgeColor}>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    <Badge className={`w-fit ${config.badgeColor}`}>{user.role}</Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
