"use client"

import { useState } from "react"
import { Header } from "@/components/reusable/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav"
import { FooterNav } from "@/components/navigation/footer-nav"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedInput } from "@/components/ui/enhanced-input"
import { EnhancedBadge } from "@/components/ui/enhanced-badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Monitor,
  Lock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "User" as const,
  avatar: "/placeholder.svg?height=120&width=120",
}

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    ticketUpdates: true,
    systemAlerts: true,
    marketingEmails: false,

    // Appearance Settings
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",

    // Privacy Settings
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    activityTracking: true,

    // Security Settings
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginAlerts: true,
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings)
    // Here you would typically save to your backend
  }

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match!")
      return
    }
    console.log("Changing password")
    // Here you would typically handle password change
    setPasswords({ current: "", new: "", confirm: "" })
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account")
      // Here you would typically handle account deletion
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10">
      <Header user={mockUser} />
      <BreadcrumbNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Settings Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Settings className="h-8 w-8 mr-3 text-blue-600" />
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
            </div>
            <EnhancedButton onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </EnhancedButton>
          </div>

          {/* Settings Content */}
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Push Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Specific Notifications</h4>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <Label>Ticket Updates</Label>
                        </div>
                        <Switch
                          checked={settings.ticketUpdates}
                          onCheckedChange={(checked) => handleSettingChange("ticketUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-500" />
                          <Label>System Alerts</Label>
                        </div>
                        <Switch
                          checked={settings.systemAlerts}
                          onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label>Marketing Emails</Label>
                        </div>
                        <Switch
                          checked={settings.marketingEmails}
                          onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-purple-600" />
                    Appearance & Display
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Theme</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Choose your preferred theme</p>
                      <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Language</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select your preferred language</p>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => handleSettingChange("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Timezone</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Set your local timezone</p>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) => handleSettingChange("timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Date Format</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Choose how dates are displayed</p>
                      <Select
                        value={settings.dateFormat}
                        onValueChange={(value) => handleSettingChange("dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Profile Visibility</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Control who can see your profile</p>
                      <Select
                        value={settings.profileVisibility}
                        onValueChange={(value) => handleSettingChange("profileVisibility", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="contacts">Contacts Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Show Email Address</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Display your email on your public profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) => handleSettingChange("showEmail", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Show Phone Number</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Display your phone number on your public profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.showPhone}
                        onCheckedChange={(checked) => handleSettingChange("showPhone", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Activity Tracking</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow us to track your activity for analytics
                        </p>
                      </div>
                      <Switch
                        checked={settings.activityTracking}
                        onCheckedChange={(checked) => handleSettingChange("activityTracking", checked)}
                      />
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-red-600" />
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.twoFactorEnabled && (
                          <EnhancedBadge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </EnhancedBadge>
                        )}
                        <Switch
                          checked={settings.twoFactorEnabled}
                          onCheckedChange={(checked) => handleSettingChange("twoFactorEnabled", checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Session Timeout</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Automatically log out after inactivity
                      </p>
                      <Select
                        value={settings.sessionTimeout}
                        onValueChange={(value) => handleSettingChange("sessionTimeout", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Login Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new login attempts</p>
                      </div>
                      <Switch
                        checked={settings.loginAlerts}
                        onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)}
                      />
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              {/* Change Password */}
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Key className="h-5 w-5 mr-2 text-blue-600" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <EnhancedInput
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <EnhancedInput
                        id="new-password"
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <EnhancedInput
                        id="confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <EnhancedButton onClick={handlePasswordChange} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Account ID</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">{mockUser.id}</p>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">January 15, 2023</p>
                    </div>
                    <div>
                      <Label>Account Status</Label>
                      <EnhancedBadge
                        variant="outline"
                        className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </EnhancedBadge>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              {/* Export Data */}
              <EnhancedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Export Your Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download a copy of all your data including tickets, messages, and account information.
                  </p>
                  <EnhancedButton variant="outline">Export Data</EnhancedButton>
                </div>
              </EnhancedCard>

              {/* Danger Zone */}
              <EnhancedCard className="border-red-200 dark:border-red-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Delete Account</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <EnhancedButton variant="destructive" onClick={handleDeleteAccount}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <FooterNav />
    </div>
  )
}
