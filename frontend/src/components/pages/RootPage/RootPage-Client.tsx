"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/stores/auth-store"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ROUTES } from "@/constants"

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push(ROUTES.DASHBOARD)
      } else {
        router.push(ROUTES.LOGIN)
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900/20">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we check your authentication status.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
