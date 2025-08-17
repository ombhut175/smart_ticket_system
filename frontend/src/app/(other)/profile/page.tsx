"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { FooterNav } from "@/components/navigation/footer-nav"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedInput } from "@/components/ui/enhanced-input"
import { EnhancedBadge } from "@/components/ui/enhanced-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { userService } from "@/services/user.service"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Award,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

// Mock user data (fallback until real profile loads)
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "User" as const,
  avatar: "/placeholder.svg?height=120&width=120",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  joinDate: "2023-01-15",
  bio: "Software developer passionate about creating efficient solutions and helping teams resolve technical challenges.",
  stats: {
    totalTickets: 24,
    resolvedTickets: 18,
    pendingTickets: 4,
    avgResponseTime: "2.5 hours",
  },
  recentActivity: [
    {
      id: "1",
      type: "ticket_created",
      title: "Created ticket: Login Issues",
      date: "2024-01-15T10:30:00Z",
      status: "open",
    },
    {
      id: "2",
      type: "ticket_resolved",
      title: "Resolved ticket: Database Connection",
      date: "2024-01-14T15:45:00Z",
      status: "resolved",
    },
    {
      id: "3",
      type: "profile_updated",
      title: "Updated profile information",
      date: "2024-01-13T09:20:00Z",
      status: "completed",
    },
  ],
}

export default function ProfilePage() {
  const { refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
  })
  const [profile, setProfile] = useState({ ...mockUser })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const me = await userService.getProfile()
        if (!mounted) return
        setProfile((p) => ({
          ...p,
          id: me.id,
          name: `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() || me.email.split("@")[0],
          email: me.email,
          role: me.role,
          joinDate: me.created_at,
        }))
        setFormData({ first_name: me.first_name ?? "", last_name: me.last_name ?? "" })
      } catch (e: any) {
        toast.error(e?.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const updated = await userService.updateProfile({ ...formData })
      toast.success("Profile updated")
      setProfile((p) => ({
        ...p,
        name: `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim() || updated.email.split("@")[0],
        email: updated.email,
        role: updated.role,
      }))
      await refreshUser()
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case "ticket_created":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "ticket_resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "profile_updated":
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10">
      <Header user={{
        id: profile.id,
        email: profile.email,
        role: (profile.role?.toLowerCase?.() || "user") as any,
        is_active: true,
        is_email_verified: false,
        is_profile_completed: !!formData.first_name && !!formData.last_name,
        created_at: profile.joinDate,
        updated_at: profile.joinDate,
        first_name: formData.first_name,
        last_name: formData.last_name,
        name: profile.name,
        avatar: profile.avatar,
      }} />
      <BreadcrumbNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <EnhancedCard className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {mockUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <EnhancedButton size="sm" className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0">
                    <Camera className="h-4 w-4" />
                  </EnhancedButton>
                </div>

                <div className="flex-1 mt-4 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                       <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name || "My Profile"}</h1>
                       <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <EnhancedBadge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                           {profile.role}
                        </EnhancedBadge>
                        <EnhancedBadge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                           {profile.joinDate ? `Joined ${new Date(profile.joinDate).toLocaleDateString()}` : ""}
                        </EnhancedBadge>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0">
                      {!isEditing ? (
                        <EnhancedButton onClick={() => setIsEditing(true)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </EnhancedButton>
                      ) : (
                        <div className="flex gap-2">
                          <EnhancedButton onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </EnhancedButton>
                          <EnhancedButton variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </EnhancedButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCard>

          {/* Profile Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <EnhancedCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <EnhancedInput
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        {isEditing ? (
                          <EnhancedInput
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {formData.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <EnhancedInput
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {formData.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <EnhancedInput
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {formData.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </EnhancedCard>

                {/* Bio Section */}
                <EnhancedCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="min-h-[120px]"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{formData.bio}</p>
                    )}
                  </div>
                </EnhancedCard>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {mockUser.recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type, activity.status)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(activity.date).toLocaleDateString()} at{" "}
                              {new Date(activity.date).toLocaleTimeString()}
                            </p>
                            <EnhancedBadge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </EnhancedBadge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedCard>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{mockUser.stats.totalTickets}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                  </div>
                </EnhancedCard>

                <EnhancedCard>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockUser.stats.resolvedTickets}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                  </div>
                </EnhancedCard>

                <EnhancedCard>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockUser.stats.pendingTickets}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  </div>
                </EnhancedCard>

                <EnhancedCard>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockUser.stats.avgResponseTime}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                  </div>
                </EnhancedCard>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <FooterNav />
    </div>
  )
}
