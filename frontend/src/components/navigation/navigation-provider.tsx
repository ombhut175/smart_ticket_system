"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface NavigationContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  breadcrumbs: Array<{ label: string; href?: string }>
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; href?: string }>>([])
  const pathname = usePathname()

  // Auto-generate breadcrumbs based on pathname
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean)
    const generatedBreadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Home", href: "/" }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

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
      const href = index === segments.length - 1 ? undefined : currentPath

      generatedBreadcrumbs.push({ label, href })
    })

    setBreadcrumbs(generatedBreadcrumbs)
  }, [pathname])

  // Page transition loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  const value = {
    isLoading,
    setIsLoading,
    breadcrumbs,
    setBreadcrumbs,
  }

  return (
    <NavigationContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="page-loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </NavigationContext.Provider>
  )
}
