
# GitHub Actions Setup for Breaking News Notifications

## Overview
This guide covers setting up GitHub Actions to automatically check for breaking news every 15 minutes, replacing Vercel cron jobs with a more flexible and cost-effective solution.

## 🚀 Quick Setup

### 1. Repository Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

#### Required Secrets:
```bash
# Your application URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Cron job security token
CRON_SECRET_TOKEN=your_secure_random_token_here

# Firebase Configuration (if using Firebase Admin)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Firebase Web Config (if needed for API calls)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 2. Generate Secure Token

Create a secure random token for the cron job:

```bash
# Generate a secure random token
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://www.uuidgenerator.net/
```

### 3. Workflow Files

The setup includes two workflow files:

#### Option A: Simple Workflow (Recommended)
- **File**: `.github/workflows/breaking-news-simple.yml`
- **Pros**: Fast, lightweight, no build required
- **Cons**: Direct API calls only

#### Option B: Full Workflow
- **File**: `.github/workflows/breaking-news-check.yml`
- **Pros**: Can run tests, build checks
- **Cons**: Slower, uses more resources

## 📋 Workflow Features

### Automatic Scheduling
- **Frequency**: Every 15 minutes
- **Timezone**: UTC
- **Cron Expression**: `*/15 * * * *`

### Manual Triggers
- **Test Mode**: Run with `testMode: true`
- **Production Mode**: Normal breaking news check
- **GitHub UI**: Go to Actions → Breaking News Check → Run workflow

### Error Handling
- **Success Summary**: Shows completion status
- **Failure Summary**: Shows error details
- **HTTP Status**: Validates API responses
- **Verbose Logging**: Detailed curl output

## 🔧 Configuration Options

### Customize Schedule

Edit the cron expression in the workflow file:

```yaml
schedule:
  # Every 5 minutes
  - cron: '*/5 * * * *'
  
  # Every hour
  - cron: '0 * * * *'
  
  # Every 6 hours
  - cron: '0 */6 * * *'
  
  # Daily at 6 AM UTC
  - cron: '0 6 * * *'
```

### Multiple Schedules

You can add multiple schedules:

```yaml
schedule:
  # Check every 15 minutes during business hours
  - cron: '*/15 9-17 * * 1-5'
  # Check every hour during off hours
  - cron: '0 * * * *'
```

### Environment-Specific Workflows

Create separate workflows for different environments:

```yaml
# .github/workflows/breaking-news-staging.yml
name: Breaking News Check (Staging)
on:
  schedule:
    - cron: '*/30 * * * *'  # Less frequent for staging

# .github/workflows/breaking-news-production.yml
name: Breaking News Check (Production)
on:
  schedule:
    - cron: '*/15 * * * *'  # More frequent for production
```

## 🧪 Testing the Setup

### 1. Manual Test Run

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Breaking News Check (Simple)"
4. Click "Run workflow"
5. Choose "test mode" and run

### 2. Test API Endpoint

```bash
# Test the cron endpoint
curl -X GET "https://yourdomain.com/api/cron/breaking-news" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_TOKEN"

# Test the breaking news check directly
curl -X POST "https://yourdomain.com/api/check-breaking-news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_TOKEN" \
  -d '{"testMode": true}'
```

### 3. Monitor Workflow Runs

- **Success**: Green checkmark in Actions tab
- **Failure**: Red X with error details
- **Logs**: Click on any run to see detailed logs

## 📊 Monitoring & Analytics

### GitHub Actions Insights

1. **Go to Actions tab** in your repository
2. **Click on workflow name** to see run history
3. **View success/failure rates**
4. **Check execution times**

### Custom Monitoring

Add monitoring to your API endpoint:

```typescript
// In your API route
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Your breaking news check logic
    const result = await checkBreakingNews();
    
    // Log success metrics
    console.log('Breaking news check completed:', {
      duration: Date.now() - startTime,
      breakingNewsFound: result.breakingNews.length,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(result);
  } catch (error) {
    // Log error metrics
    console.error('Breaking news check failed:', {
      duration: Date.now() - startTime,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
```

## 🔒 Security Best Practices

### 1. Secret Management
- **Never commit secrets** to repository
- **Use GitHub Secrets** for sensitive data
- **Rotate tokens regularly**
- **Use least privilege principle**

### 2. API Security
- **Validate Authorization header**
- **Rate limit API endpoints**
- **Log all requests**
- **Monitor for abuse**

### 3. Workflow Security
- **Use specific action versions**
- **Review third-party actions**
- **Enable branch protection**
- **Require reviews for workflow changes**

## 🚨 Troubleshooting

### Common Issues

#### 1. Workflow Not Running
```bash
# Check if workflow is enabled
# Go to Actions tab → All workflows → Enable workflow

# Check cron syntax
# Use online cron validator: https://crontab.guru/
```

#### 2. API Endpoint Not Responding
```bash
# Check if your app is deployed
curl -I https://yourdomain.com/api/cron/breaking-news

# Check API logs
# Look at your hosting platform logs (Vercel, Netlify, etc.)
```

#### 3. Authentication Failures
```bash
# Verify secret is set correctly
# Go to Settings → Secrets and variables → Actions

# Test token manually
curl -X GET "https://yourdomain.com/api/cron/breaking-news" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. RSS Feed Issues
```bash
# Test RSS feeds directly
curl -I "https://feeds.skynews.com/feeds/rss/home.xml"
curl -I "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss.xml"
```

### Debug Mode

Enable debug logging in your API:

```typescript
// Add to your API route
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
}
```

## 📈 Performance Optimization

### 1. Reduce Workflow Frequency
- **Start with hourly checks**
- **Increase frequency based on needs**
- **Monitor resource usage**

### 2. Optimize API Response
- **Cache RSS feed data**
- **Use efficient parsing**
- **Limit notification batches**

### 3. Cost Management
- **GitHub Actions**: 2,000 minutes/month free
- **Monitor usage**: Settings → Billing
- **Optimize workflow duration**

## 🔄 Alternative Solutions

### 1. External Cron Services
- **cron-job.org**: Free tier available
- **EasyCron**: Paid service
- **SetCronJob**: Free tier available

### 2. Serverless Functions
- **Vercel Cron Jobs**: If available
- **Netlify Functions**: With external triggers
- **AWS Lambda**: With EventBridge

### 3. Self-Hosted Solutions
- **Docker containers** with cron
- **VPS with crontab**
- **Kubernetes CronJobs**

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Guide](https://crontab.guru/)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## 🎯 Next Steps

1. **Set up repository secrets**
2. **Test the workflow manually**
3. **Monitor the first few runs**
4. **Adjust frequency as needed**
5. **Set up monitoring alerts**

Your breaking news notification system is now powered by GitHub Actions! 🚀
