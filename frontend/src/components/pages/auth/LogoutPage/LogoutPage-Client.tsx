'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from "@/stores/auth-store"
import { toast } from 'sonner'
import { ROUTES } from "@/constants"

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast.success('Logged out successfully')
      router.push(ROUTES.LOGIN)
    } catch (error) {
      toast.error('Failed to logout. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!user) {
      router.push(ROUTES.LOGIN)
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Confirm Logout</CardTitle>
          <CardDescription>
            Are you sure you want to log out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoggingOut}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1"
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
