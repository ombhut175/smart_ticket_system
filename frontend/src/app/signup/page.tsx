"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, Ticket, Eye, EyeOff, CheckCircle, Mail, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsSuccess(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!mounted) return null

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-teal-900/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/50 shadow-2xl animate-slide-up relative z-10">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center relative">
                <div className="relative">
                  <CheckCircle className="h-20 w-20 text-green-500 animate-pulse-glow" />
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gradient-emerald">Welcome Aboard!</h2>
                <p className="text-gray-600 dark:text-gray-300">Your account has been created successfully</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="font-medium">Check your email</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a confirmation link to{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">{formData.email}</span>. Please
                  click the link to activate your account and start using Smart Ticket.
                </p>
              </div>

              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
              >
                <Link href="/login">
                  Continue to Login
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl animate-float" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-lg animate-fade-in">
          <div className="flex items-center justify-center mb-8 group">
            <div className="relative">
              <Ticket className="h-20 w-20 text-emerald-600 dark:text-emerald-400 animate-float" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="ml-4">
              <h1 className="text-5xl font-bold text-gradient-emerald">Smart Ticket</h1>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          </div>

          <div className="space-y-6 animate-slide-up">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Join Smart Ticket</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Create your account and experience the future of customer support with AI-powered ticket management
            </p>

            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300">Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300">AI-powered automation</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300">Real-time notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4 group">
              <Ticket className="h-12 w-12 mr-3 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-3xl font-bold text-gradient-emerald">Smart Ticket</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Join Smart Ticket</h2>
          </div>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-center text-foreground">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="h-12 pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="h-12 pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group bg-transparent"
                >
                  <Link href="/login">
                    Sign In Instead
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
