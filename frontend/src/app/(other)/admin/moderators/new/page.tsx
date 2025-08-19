"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, UserPlus, Plus, Trash2, CheckCircle, Shield, Loader2 } from "lucide-react"

// Add these imports at the top
import { User } from "@/types";
import { toast } from "sonner";
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/lib/swr/fetchers'

const mockAdmin: User = { name: "", email: "", role: "admin", is_active: true, is_email_verified: false, is_profile_completed: false, id: "", created_at: "", updated_at: "" }

interface Skill {
  id: string
  name: string
  proficiency: string
}

export default function PromoteModeratorPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    userFound: false,
    userName: "",
    userEmail: "",
  })

  const [skills, setSkills] = useState<Skill[]>([{ id: "1", name: "", proficiency: "" }])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    skills.forEach((skill, index) => {
      if (!skill.name.trim()) {
        newErrors[`skill_${index}_name`] = "Skill name is required"
      }
      if (!skill.proficiency) {
        newErrors[`skill_${index}_proficiency`] = "Proficiency level is required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Submit = async () => {
    if (!validateStep1()) return

    setIsLoading(true)
    try {
      // We don't have a direct endpoint to find by email; proceed to step 2 assuming email exists.
      setFormData((prev) => ({ ...prev, userFound: true, userName: formData.email.split("@")[0], userEmail: formData.email }))
      setCurrentStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const { trigger: promoteMod } = useSWRMutation('/users/moderator', postFetcher)

  const handleStep2Submit = async () => {
    if (!validateStep2()) return

    setIsLoading(true)
    try {
      const payload = skills.map((s) => ({
        skill_name: s.name.trim(),
        proficiency_level: (s.proficiency.toLowerCase() as any) || "beginner",
      }))
      await promoteMod({ email: formData.email, skills: payload })
      setIsSuccess(true)
      toast.success("User promoted to moderator")
    } catch (e: any) {
      toast.error(e?.message || "Failed to promote moderator")
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      proficiency: "",
    }
    setSkills([...skills, newSkill])
  }

  const removeSkill = (id: string) => {
    if (skills.length > 1) {
      setSkills(skills.filter((skill) => skill.id !== id))
    }
  }

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)))

    // Clear errors when user starts typing
    const errorKey = `skill_${skills.findIndex((s) => s.id === id)}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Moderator Promoted!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.userName} has been successfully promoted to moderator with the specified skills.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <Header user={mockAdmin} variant="admin" />

      <div className="flex">
        <SidebarNav userRole="Admin" />

        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BreadcrumbNav />
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                asChild
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to User Management
                </Link>
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= 1 ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300 text-gray-300"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= 1 ? "text-purple-600 dark:text-purple-400" : "text-gray-500"
                    }`}
                  >
                    Find User
                  </span>
                </div>
                <div className={`flex-1 h-1 ${currentStep >= 2 ? "bg-purple-600" : "bg-gray-300"}`} />
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= 2 ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300 text-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= 2 ? "text-purple-600 dark:text-purple-400" : "text-gray-500"
                    }`}
                  >
                    Add Skills
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Find User */}
            {currentStep === 1 && (
              <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-4">
                      <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Promote User to Moderator
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Enter the email address of the user you want to promote to moderator
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      User Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter user's email address"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                        if (errors.email) {
                          setErrors((prev) => ({ ...prev, email: "" }))
                        }
                      }}
                      className={`h-12 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                  </div>

                  <Button
                    onClick={handleStep1Submit}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Finding User...
                      </>
                    ) : (
                      <>
                        Find User
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Add Skills */}
            {currentStep === 2 && (
              <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                      <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Add Moderator Skills
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Define the skills and expertise areas for {formData.userName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* User Info */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                          {formData.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{formData.userName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.userEmail}</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Ready for Promotion
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Moderator Skills</h3>
                      <Button onClick={addSkill} variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Plus className="h-4 w-4" />
                        Add Skill
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {skills.map((skill, index) => (
                        <div
                          key={skill.id}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name *</Label>
                            <Input
                              placeholder="e.g., Customer Support, Technical Issues"
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                              className={errors[`skill_${index}_name`] ? "border-red-500" : ""}
                              disabled={isLoading}
                            />
                            {errors[`skill_${index}_name`] && (
                              <p className="text-sm text-red-600 dark:text-red-400">{errors[`skill_${index}_name`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Proficiency Level *
                            </Label>
                            <Select
                              value={skill.proficiency}
                              onValueChange={(value) => updateSkill(skill.id, "proficiency", value)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className={errors[`skill_${index}_proficiency`] ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors[`skill_${index}_proficiency`] && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {errors[`skill_${index}_proficiency`]}
                              </p>
                            )}
                          </div>

                          <div className="flex items-end">
                            <Button
                              onClick={() => removeSkill(skill.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={skills.length === 1 || isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1" disabled={isLoading}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleStep2Submit}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Promoting User...
                        </>
                      ) : (
                        <>
                          Promote to Moderator
                          <CheckCircle className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
