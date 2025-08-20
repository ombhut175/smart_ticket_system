"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, Lock, ArrowLeft, Home, HelpCircle } from "lucide-react"

export default function PermissionDeniedPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/50 shadow-2xl">
        <CardContent className="p-12 text-center space-y-8">
          {/* Illustration */}
          <div className="flex justify-center relative">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
                <Shield className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">403</h1>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Sorry, you don't have permission to access this page. This area is restricted to authorized users only.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-8 py-3 h-12"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-8 py-3 h-12 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Please{" "}
              <Link href="/tickets/new" className="text-red-600 dark:text-red-400 hover:underline font-medium">
                submit a support ticket
              </Link>{" "}
              or contact your system administrator for access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
