# Firebase Authentication Setup

This project now uses Firebase Authentication with Google Sign-In. Follow these steps to set up Firebase:

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

## 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Client Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side) - Required for API routes
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

**Important**: All environment variables are required. The application will throw an error if any are missing.

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Copy the configuration values to your `.env.local` file

## 4. Install Dependencies

```bash
npm install firebase
```

## 5. Features

- ✅ Google Sign-In authentication
- ✅ Automatic user creation in Firestore
- ✅ Protected routes (login required for /verify)
- ✅ User profile with real data from Firebase
- ✅ Secure authentication flow

## 6. Authentication Flow

1. User visits `/login` or `/signup`
2. Clicks "Continue with Google" or "Sign up with Google"
3. Google OAuth popup opens
4. User signs in with Google account
5. User data is automatically saved to Firestore
6. User is redirected to `/verify` page
7. All user data is now dynamic from Firebase

## 7. User Data Structure

Users are stored in Firestore with the following structure:
```javascript
{
  uid: string,
  name: string,
  email: string,
  avatar: string,
  plan: 'free' | 'pro' | 'enterprise',
  tokensDaily: number,
  tokensMonthly: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```
