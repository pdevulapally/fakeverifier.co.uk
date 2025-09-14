import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// RSS feed URLs for breaking news detection
const RSS_FEEDS = {
  skyNews: 'https://feeds.skynews.com/feeds/rss/home.xml',
  bbcNews: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss.xml'
};

// XML Parser configuration
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: true,
  parseTagValue: false,
  trimValues: true
});

// Keywords that indicate breaking news
const BREAKING_KEYWORDS = [
  'breaking', 'urgent', 'alert', 'developing', 'just in', 'live', 'emergency',
  'crisis', 'attack', 'explosion', 'shooting', 'fire', 'crash', 'accident',
  'election', 'vote', 'result', 'announcement', 'resignation', 'death',
  'pandemic', 'outbreak', 'disaster', 'flood', 'earthquake', 'storm'
];

// Fetch RSS feed
async function fetchRSSFeed(url: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'FakeVerifier-Bot/1.0 (Breaking News Detector)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    return parser.parse(xmlText);
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return null;
  }
}

// Check if article is breaking news
function isBreakingNews(article: any): boolean {
  const title = (article.title?.['#text'] || article.title || '').toLowerCase();
  const description = (article.description?.['#text'] || article.description || '').toLowerCase();
  const content = `${title} ${description}`;

  // Check for breaking keywords
  const hasBreakingKeyword = BREAKING_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  );

  // Check if published within last hour (likely breaking)
  const pubDate = article.pubDate?.['#text'] || article.pubDate || '';
  if (pubDate) {
    try {
      const publishedAt = new Date(pubDate);
      const now = new Date();
      const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
      
      // If published within last hour and has breaking keywords
      if (hoursDiff <= 1 && hasBreakingKeyword) {
        return true;
      }
    } catch (error) {
      console.warn('Error parsing date:', pubDate, error);
    }
  }

  return hasBreakingKeyword;
}

// Send notification via our API
async function sendNotification(article: any, source: string) {
  try {
    const title = article.title?.['#text'] || article.title || 'Breaking News';
    const description = article.description?.['#text'] || article.description || '';
    const link = article.link?.['#text'] || article.link || '';
    
    // Extract image if available
    const media = article['media:content'] || article['media:thumbnail'] || article.enclosure;
    const imageUrl = media?.['@_url'] || media?.['#text'] || '';

    const notificationData = {
      title: `🚨 ${title}`,
      body: description.length > 100 ? description.substring(0, 100) + '...' : description,
      imageUrl: imageUrl || undefined,
      category: 'breaking',
      source: source,
      url: link,
      breakingNews: true
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.status}`);
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);
    
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Check for breaking news and send notifications
async function checkBreakingNews() {
  const breakingNewsFound = [];
  
  for (const [source, url] of Object.entries(RSS_FEEDS)) {
    try {
      console.log(`Checking ${source} for breaking news...`);
      
      const rssData = await fetchRSSFeed(url);
      if (!rssData) {
        console.warn(`Failed to fetch ${source} RSS feed`);
        continue;
      }

      const channel = rssData.rss?.channel || rssData.feed || rssData;
      const items = channel?.item || channel?.entry || [];
      
      if (!Array.isArray(items)) {
        console.warn(`No items found in ${source} RSS feed`);
        continue;
      }

      // Check the first 5 items (most recent)
      const recentItems = items.slice(0, 5);
      
      for (const item of recentItems) {
        if (isBreakingNews(item)) {
          console.log(`Breaking news detected in ${source}:`, item.title?.['#text'] || item.title);
          
          try {
            await sendNotification(item, source);
            breakingNewsFound.push({
              source,
              title: item.title?.['#text'] || item.title,
              url: item.link?.['#text'] || item.link
            });
          } catch (error) {
            console.error(`Failed to send notification for ${source}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${source} for breaking news:`, error);
    }
  }

  return breakingNewsFound;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting breaking news check...');
    
    const breakingNews = await checkBreakingNews();
    
    return NextResponse.json({
      success: true,
      message: 'Breaking news check completed',
      breakingNewsFound: breakingNews.length,
      breakingNews: breakingNews,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error checking breaking news:', error);
    return NextResponse.json(
      { error: 'Failed to check breaking news', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testMode = false } = body;
    
    console.log('Manual breaking news check triggered...');
    
    if (testMode) {
      // Send a test notification
      const testNotification = {
        title: '🧪 Test Breaking News Alert',
        body: 'This is a test notification to verify the system is working correctly.',
        category: 'test',
        source: 'system',
        breakingNews: true
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification)
      });

      if (!response.ok) {
        throw new Error(`Failed to send test notification: ${response.status}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Test notification sent',
        timestamp: new Date().toISOString()
      });
    }
    
    const breakingNews = await checkBreakingNews();
    
    return NextResponse.json({
      success: true,
      message: 'Breaking news check completed',
      breakingNewsFound: breakingNews.length,
      breakingNews: breakingNews,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error in manual breaking news check:', error);
    return NextResponse.json(
      { error: 'Failed to check breaking news', details: error.message },
      { status: 500 }
    );
  }
}
