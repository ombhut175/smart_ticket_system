"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page by default
    router.push("/login")
  }, [router])

  return null
}
