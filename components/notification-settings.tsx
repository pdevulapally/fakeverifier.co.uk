"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  BellOff, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Globe,
  TrendingUp,
  Newspaper,
  Shield,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  getNotificationPreferences, 
  updateNotificationPreferences,
  requestNotificationPermission,
  saveFCMToken,
  isNotificationSupported,
  getNotificationPermissionStatus,
  NotificationPreferences
} from '@/lib/firebase'

const CATEGORIES = [
  { id: 'politics', label: 'Politics', icon: TrendingUp },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'technology', label: 'Technology', icon: Shield },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'entertainment', label: 'Entertainment', icon: Zap },
  { id: 'sports', label: 'Sports', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: Shield },
  { id: 'education', label: 'Education', icon: Shield },
]

const FREQUENCY_OPTIONS = [
  { id: 'immediate', label: 'Immediate', description: 'Get notified as soon as news breaks' },
  { id: 'hourly', label: 'Hourly Digest', description: 'Receive updates once per hour' },
  { id: 'daily', label: 'Daily Summary', description: 'Get a daily news summary' },
]

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const supported = isNotificationSupported()
    setIsSupported(supported)
    
    if (supported) {
      setPermission(getNotificationPermissionStatus())
      loadPreferences()
    }
  }, [])

  const loadPreferences = async () => {
    try {
      const result = await getNotificationPreferences()
      if (result.success && result.data) {
        setPreferences(result.data)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      const result = await requestNotificationPermission()
      
      if (result.success && result.token) {
        await saveFCMToken(result.token)
        setPermission('granted')
        await loadPreferences()
      } else {
        setPermission('denied')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      setPermission('denied')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!preferences) return

    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences({ enabled })
      if (result.success) {
        setPreferences({ ...preferences, enabled })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleBreakingNews = async (breakingNews: boolean) => {
    if (!preferences) return

    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences({ breakingNews })
      if (result.success) {
        setPreferences({ ...preferences, breakingNews })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleCategory = async (categoryId: string) => {
    if (!preferences) return

    const currentCategories = preferences.categoryAlerts || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]

    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences({ categoryAlerts: newCategories })
      if (result.success) {
        setPreferences({ ...preferences, categoryAlerts: newCategories })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeFrequency = async (frequency: 'immediate' | 'hourly' | 'daily') => {
    if (!preferences) return

    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences({ frequency })
      if (result.success) {
        setPreferences({ ...preferences, frequency })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { 
          icon: CheckCircle, 
          text: 'Enabled', 
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        }
      case 'denied':
        return { 
          icon: XCircle, 
          text: 'Blocked', 
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        }
      default:
        return { 
          icon: AlertCircle, 
          text: 'Not Set', 
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        }
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  const status = getPermissionStatus()
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Permission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={cn("h-5 w-5", status.color)} />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {status.text}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {permission === 'granted' 
                    ? 'You can receive push notifications'
                    : permission === 'denied'
                    ? 'Notifications are blocked by your browser'
                    : 'Click to enable push notifications'
                  }
                </p>
              </div>
            </div>
            
            {permission === 'default' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Requesting...' : 'Enable Notifications'}
              </Button>
            )}
            
            {permission === 'denied' && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Blocked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {permission === 'granted' && preferences && (
        <>
          {/* Main Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Turn on/off all push notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.enabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Breaking News */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Breaking News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Breaking News Alerts
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified immediately when major news breaks
                  </p>
                </div>
                <Switch
                  checked={preferences.breakingNews}
                  onCheckedChange={handleToggleBreakingNews}
                  disabled={isSaving || !preferences.enabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Category Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose which news categories you want to be notified about
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon
                    const isSelected = preferences.categoryAlerts?.includes(category.id) || false
                    
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleCategory(category.id)}
                        disabled={isSaving || !preferences.enabled}
                        className={cn(
                          "h-auto p-3 flex flex-col items-center gap-2",
                          isSelected 
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{category.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frequency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  How often would you like to receive notifications?
                </p>
                
                <div className="space-y-2">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      variant={preferences.frequency === option.id ? "default" : "outline"}
                      onClick={() => handleChangeFrequency(option.id as any)}
                      disabled={isSaving || !preferences.enabled}
                      className={cn(
                        "w-full justify-start h-auto p-4",
                        preferences.frequency === option.id
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs opacity-80">{option.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
