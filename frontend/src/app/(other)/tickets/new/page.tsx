"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Ticket, Send, Loader2, CheckCircle } from "lucide-react"
import { ticketService } from "@/services/ticket.service"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

// Add these imports at the top
import { User } from "@/types";
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"

const mockUser: User = { name: "", email: "", role: "user", is_active: true, is_email_verified: false, is_profile_completed: false, id: "", created_at: "", updated_at: "" }

export default function NewTicketPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters long"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters long"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await ticketService.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
      })
      setIsSuccess(true)
      toast.success("Ticket created successfully")
      setTimeout(() => router.push("/tickets"), 1000)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!mounted) return null

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Created Successfully!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your support ticket has been submitted. We'll get back to you soon.
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Redirecting to your tickets...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <Header user={user ?? mockUser} variant="user" />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav />
        {/* Back Button */}
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Link href="/tickets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Link>
            </Button>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-4">
                  <Ticket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Submit a New Ticket</CardTitle>
              <CardDescription className="text-lg">
                Describe your issue and we'll help you resolve it quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`h-12 ${errors.title ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
                </div>

                {/* Priority Field */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority *
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`h-12 ${errors.priority ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - General questions or minor issues</SelectItem>
                      <SelectItem value="Medium">Medium - Issues affecting functionality</SelectItem>
                      <SelectItem value="High">High - Critical issues or urgent requests</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-sm text-red-600 dark:text-red-400">{errors.priority}</p>}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`min-h-[120px] resize-none ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Ticket
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  By submitting this ticket, you agree to our terms of service and privacy policy.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
