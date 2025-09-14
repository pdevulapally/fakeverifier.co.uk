"use client"

import React, { useEffect, useState } from 'react'
import { 
  requestNotificationPermission, 
  saveFCMToken, 
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermissionStatus,
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences
} from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellOff, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationServiceProps {
  className?: string
  showSettings?: boolean
  onPermissionChange?: (granted: boolean) => void
}

export function NotificationService({ 
  className, 
  showSettings = false,
  onPermissionChange 
}: NotificationServiceProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = isNotificationSupported()
    setIsSupported(supported)
    
    if (supported) {
      const currentPermission = getNotificationPermissionStatus()
      setPermission(currentPermission)
      onPermissionChange?.(currentPermission === 'granted')
      
      // Load user preferences
      loadPreferences()
    }
  }, [])

  useEffect(() => {
    if (!isSupported) return

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload)
      
      // Show custom notification UI or handle the message
      if (payload.notification) {
        // You can show a custom toast or modal here
        console.log('Notification:', payload.notification)
      }
    })

    return unsubscribe
  }, [isSupported])

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
    if (!isSupported) return

    setIsLoading(true)
    try {
      const result = await requestNotificationPermission()
      
      if (result.success && result.token) {
        // Save token to Firestore
        await saveFCMToken(result.token)
        setPermission('granted')
        onPermissionChange?.(true)
        
        // Load preferences after successful permission
        await loadPreferences()
      } else {
        setPermission('denied')
        onPermissionChange?.(false)
        console.error('Permission request failed:', result.error)
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      setPermission('denied')
      onPermissionChange?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleNotifications = async () => {
    if (!preferences) return

    const newEnabled = !preferences.enabled
    const result = await updateNotificationPreferences({ enabled: newEnabled })
    
    if (result.success) {
      setPreferences({ ...preferences, enabled: newEnabled })
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
      <div className={cn("flex items-center gap-2 text-slate-500 dark:text-slate-400", className)}>
        <BellOff className="h-4 w-4" />
        <span className="text-sm">Notifications not supported</span>
      </div>
    )
  }

  const status = getPermissionStatus()
  const StatusIcon = status.icon

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Permission Status */}
      <div className="flex items-center gap-2">
        <StatusIcon className={cn("h-4 w-4", status.color)} />
        <span className={cn("text-sm font-medium", status.color)}>
          {status.text}
        </span>
      </div>

      {/* Action Buttons */}
      {permission === 'default' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestPermission}
          disabled={isLoading}
          className="h-8 px-3 text-xs"
        >
          <Bell className="h-3 w-3 mr-1" />
          {isLoading ? 'Requesting...' : 'Enable'}
        </Button>
      )}

      {permission === 'granted' && preferences && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleNotifications}
            className={cn(
              "h-8 px-3 text-xs",
              preferences.enabled 
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            )}
          >
            {preferences.enabled ? (
              <>
                <Bell className="h-3 w-3 mr-1" />
                On
              </>
            ) : (
              <>
                <BellOff className="h-3 w-3 mr-1" />
                Off
              </>
            )}
          </Button>

          {showSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {permission === 'denied' && (
        <Badge variant="outline" className="text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Blocked by browser
        </Badge>
      )}

      {/* Preferences Panel */}
      {showPreferences && preferences && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Notification Settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Breaking News
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateNotificationPreferences({ 
                  breakingNews: !preferences.breakingNews 
                }).then(() => loadPreferences())}
                className={cn(
                  "h-6 px-2 text-xs",
                  preferences.breakingNews 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                )}
              >
                {preferences.breakingNews ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Category Alerts
              </span>
              <Badge variant="secondary" className="text-xs">
                {preferences.categoryAlerts.length} selected
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Frequency
              </span>
              <Badge variant="outline" className="text-xs">
                {preferences.frequency}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for using notifications in other components
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)

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

  return {
    isSupported,
    permission,
    preferences,
    isEnabled: permission === 'granted' && preferences?.enabled,
    loadPreferences
  }
}
