"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  Bell, 
  Shield, 
  Eye, 
  Lock, 
  Mail, 
  Smartphone, 
  Globe, 
  Palette,
  Save,
  X,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      allowMessages: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true
    },
    appearance: {
      theme: "system",
      compactMode: false,
      showAnimations: true
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement settings save API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Public</Badge>
      case "private":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Private</Badge>
      case "friends":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Friends Only</Badge>
      default:
        return <Badge variant="outline">{visibility}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security settings</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => handleSettingChange("notifications", "sms", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Label htmlFor="marketing-notifications">Marketing Emails</Label>
              </div>
              <Switch
                id="marketing-notifications"
                checked={settings.notifications.marketing}
                onCheckedChange={(checked) => handleSettingChange("notifications", "marketing", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              Privacy
            </CardTitle>
            <CardDescription>Control your profile visibility and data sharing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <div className="flex items-center gap-2">
                {getVisibilityBadge(settings.privacy.profileVisibility)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const options = ["public", "private", "friends"]
                    const currentIndex = options.indexOf(settings.privacy.profileVisibility)
                    const nextIndex = (currentIndex + 1) % options.length
                    handleSettingChange("privacy", "profileVisibility", options[nextIndex])
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Label htmlFor="show-email">Show Email in Profile</Label>
              </div>
              <Switch
                id="show-email"
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => handleSettingChange("privacy", "showEmail", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <Label htmlFor="show-phone">Show Phone in Profile</Label>
              </div>
              <Switch
                id="show-phone"
                checked={settings.privacy.showPhone}
                onCheckedChange={(checked) => handleSettingChange("privacy", "showPhone", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Label htmlFor="allow-messages">Allow Direct Messages</Label>
              </div>
              <Switch
                id="allow-messages"
                checked={settings.privacy.allowMessages}
                onCheckedChange={(checked) => handleSettingChange("privacy", "allowMessages", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
              </div>
              <Switch
                id="two-factor-auth"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("security", "twoFactorAuth", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="5"
                max="1440"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="login-notifications">Login Notifications</Label>
              </div>
              <Switch
                id="login-notifications"
                checked={settings.security.loginNotifications}
                onCheckedChange={(checked) => handleSettingChange("security", "loginNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your interface preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={settings.appearance.theme}
                onChange={(e) => handleSettingChange("appearance", "theme", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <Label htmlFor="compact-mode">Compact Mode</Label>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => handleSettingChange("appearance", "compactMode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <Label htmlFor="show-animations">Show Animations</Label>
              </div>
              <Switch
                id="show-animations"
                checked={settings.appearance.showAnimations}
                onCheckedChange={(checked) => handleSettingChange("appearance", "showAnimations", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Account Status
          </CardTitle>
          <CardDescription>Your current account information and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Email Verified</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {user.emailVerified ? "Verified" : "Not verified"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Account Status</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 capitalize">{user.status}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium text-purple-800 dark:text-purple-200">Member Since</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
