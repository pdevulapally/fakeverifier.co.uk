# Firebase Push Notifications Setup Guide

## Overview
This guide covers the complete Firebase Cloud Messaging (FCM) setup for FakeVerifier, enabling real-time push notifications for breaking news and user updates.

## Features Implemented

### 🔔 **Push Notification System**
- **Real-time notifications**: Instant alerts for breaking news
- **Background notifications**: Works even when app is closed
- **Foreground notifications**: Custom handling when app is open
- **Notification actions**: Click to read, dismiss options
- **Rich notifications**: Images, badges, and custom actions

### ⚙️ **User Preferences**
- **Permission management**: Request and handle notification permissions
- **Category subscriptions**: Choose which news categories to follow
- **Frequency settings**: Immediate, hourly, or daily notifications
- **Breaking news alerts**: Special notifications for urgent news
- **Enable/disable toggle**: Full control over notification preferences

### 🤖 **Automated System**
- **Breaking news detection**: Automatic monitoring of RSS feeds
- **Smart filtering**: Keyword-based breaking news identification
- **Scheduled checks**: Cron jobs for continuous monitoring
- **Multi-source support**: Sky News and BBC News integration

## Technical Implementation

### 1. Firebase Configuration

#### Environment Variables Required:
```env
# Firebase Web App Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# FCM VAPID Key (for web push)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Cron Job Security
CRON_SECRET_TOKEN=your_secret_token
```

#### Firebase Console Setup:
1. **Enable Cloud Messaging** in Firebase Console
2. **Generate VAPID Key** for web push notifications
3. **Create Service Account** for server-side operations
4. **Configure Web App** with your domain

### 2. Service Worker (`public/firebase-messaging-sw.js`)

The service worker handles:
- **Background message reception**
- **Notification display** with custom styling
- **Click handling** to open relevant pages
- **Action buttons** (Read Now, Dismiss)
- **Notification dismissal tracking**

### 3. Core Components

#### `components/notification-service.tsx`
- **Permission management**
- **Token registration**
- **Foreground message handling**
- **Status indicators**

#### `components/notification-settings.tsx`
- **User preference management**
- **Category selection**
- **Frequency settings**
- **Breaking news toggles**

### 4. API Endpoints

#### `/api/send-notification`
- **Send notifications** to specific users or groups
- **Batch processing** for multiple tokens
- **Rich notification support** with images and actions
- **Targeting by preferences** (category, breaking news)

#### `/api/check-breaking-news`
- **Monitor RSS feeds** for breaking news
- **Keyword detection** for urgent content
- **Automatic notification sending**
- **Test mode** for debugging

#### `/api/cron/breaking-news`
- **Scheduled execution** endpoint
- **Security token validation**
- **External cron service integration**

### 5. Database Structure

#### Firestore Collections:

**`fcmTokens`**
```javascript
{
  userId: string,
  token: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  active: boolean
}
```

**`notificationPreferences`**
```javascript
{
  userId: string,
  breakingNews: boolean,
  categoryAlerts: string[],
  frequency: 'immediate' | 'hourly' | 'daily',
  enabled: boolean,
  lastUpdated: timestamp
}
```

**`notificationLogs`**
```javascript
{
  title: string,
  body: string,
  category: string,
  source: string,
  tokensSent: number,
  successCount: number,
  failureCount: number,
  timestamp: timestamp,
  criteria: object
}
```

## Setup Instructions

### 1. Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize project
   firebase init
   ```

2. **Enable Cloud Messaging**
   - Go to Firebase Console → Project Settings
   - Navigate to Cloud Messaging tab
   - Generate VAPID key pair
   - Add web app configuration

3. **Create Service Account**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file
   - Extract credentials for environment variables

### 2. Environment Configuration

1. **Add to `.env.local`**:
   ```env
   # Copy all required environment variables from above
   ```

2. **Update Firebase Config**:
   - Replace placeholder values with actual Firebase credentials
   - Ensure VAPID key is correctly set

### 3. Service Worker Registration

The service worker is automatically registered when the notification service initializes. Ensure the file is accessible at `/firebase-messaging-sw.js`.

### 4. Cron Job Setup

#### Option 1: Vercel Cron Jobs
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/breaking-news",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### Option 2: External Cron Service
- Use services like cron-job.org
- Set URL: `https://yourdomain.com/api/cron/breaking-news`
- Add Authorization header: `Bearer YOUR_CRON_SECRET_TOKEN`
- Schedule: Every 15 minutes

#### Option 3: GitHub Actions
```yaml
# .github/workflows/breaking-news.yml
name: Breaking News Check
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  check-news:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger breaking news check
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}" \
            https://yourdomain.com/api/cron/breaking-news
```

## Usage Examples

### 1. Request Notification Permission

```javascript
import { requestNotificationPermission, saveFCMToken } from '@/lib/firebase';

const handleEnableNotifications = async () => {
  const result = await requestNotificationPermission();
  if (result.success && result.token) {
    await saveFCMToken(result.token);
    console.log('Notifications enabled!');
  }
};
```

### 2. Send Custom Notification

```javascript
// Via API
const response = await fetch('/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Breaking News Alert',
    body: 'Major development in technology sector',
    category: 'technology',
    breakingNews: true
  })
});
```

### 3. Update User Preferences

```javascript
import { updateNotificationPreferences } from '@/lib/firebase';

const updatePreferences = async () => {
  await updateNotificationPreferences({
    breakingNews: true,
    categoryAlerts: ['politics', 'technology'],
    frequency: 'immediate'
  });
};
```

## Testing

### 1. Test Notification Permission
```javascript
// Check if notifications are supported
import { isNotificationSupported } from '@/lib/firebase';

if (isNotificationSupported()) {
  console.log('Notifications supported');
}
```

### 2. Test Breaking News Detection
```bash
# Manual test
curl -X POST https://yourdomain.com/api/check-breaking-news \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'
```

### 3. Test Cron Job
```bash
# Test cron endpoint
curl -X GET https://yourdomain.com/api/cron/breaking-news \
  -H "Authorization: Bearer YOUR_CRON_SECRET_TOKEN"
```

## Troubleshooting

### Common Issues

1. **Service Worker Not Loading**
   - Check file path: `/public/firebase-messaging-sw.js`
   - Verify HTTPS (required for notifications)
   - Check browser console for errors

2. **Permission Denied**
   - Ensure user interaction before requesting permission
   - Check browser notification settings
   - Verify VAPID key configuration

3. **Notifications Not Received**
   - Check FCM token registration
   - Verify user preferences are enabled
   - Check notification logs in Firebase Console

4. **Cron Job Not Working**
   - Verify CRON_SECRET_TOKEN is set
   - Check external cron service configuration
   - Review server logs for errors

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed console logs for troubleshooting.

## Security Considerations

1. **Token Security**: FCM tokens are stored securely in Firestore
2. **Permission Validation**: All API endpoints validate user permissions
3. **Rate Limiting**: Implement rate limiting for notification sending
4. **Cron Security**: Use secret tokens for cron job authentication
5. **Data Privacy**: User preferences are stored per-user in Firestore

## Performance Optimization

1. **Batch Notifications**: Send to multiple users in batches
2. **Token Cleanup**: Remove inactive tokens regularly
3. **Caching**: Cache user preferences for faster access
4. **Rate Limiting**: Prevent notification spam
5. **Monitoring**: Track notification delivery rates

## Monitoring & Analytics

### Firebase Console
- **Cloud Messaging**: View notification statistics
- **Analytics**: Track user engagement
- **Crashlytics**: Monitor for errors

### Custom Logging
- **Notification Logs**: Track all sent notifications
- **User Preferences**: Monitor preference changes
- **Error Tracking**: Log failed notifications

## Future Enhancements

1. **Rich Notifications**: Add more interactive elements
2. **Scheduled Notifications**: Send notifications at specific times
3. **Geographic Targeting**: Location-based notifications
4. **A/B Testing**: Test different notification formats
5. **Analytics Dashboard**: Detailed notification analytics
6. **Multi-language Support**: Localized notifications
7. **Notification Templates**: Predefined notification formats

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Test with different browsers
4. Verify environment variables
5. Check network connectivity

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
