'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="space-y-2">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>
    </div>
  )
}
