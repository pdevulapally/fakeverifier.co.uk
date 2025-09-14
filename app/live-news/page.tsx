"use client"

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PremiumNewsCard } from '@/components/premium-news-card'
import { NewsGridSkeleton, CategorySkeleton, HeaderSkeleton } from '@/components/ui/loading-skeleton'
import { NotificationService } from '@/components/notification-service'
import { 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  Search,
  TrendingUp,
  Globe,
  Newspaper,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  author: string
  category: string
  tags: string[]
  mediaUrl: string
  mediaType: string
  source: string
  relevance: number
}

interface NewsResponse {
  success: boolean
  data: NewsArticle[]
  total: number
  filtered: number
  returned: number
  category: string
  query: string | null
  timestamp: string
}

const NEWS_SOURCES = [
  { id: 'sky-news', label: 'Sky News', icon: TrendingUp },
  { id: 'bbc-news', label: 'BBC News', icon: Globe },
]

const SKY_NEWS_CATEGORIES = [
  { id: 'home', label: 'Home', icon: Newspaper },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'uk', label: 'UK', icon: TrendingUp },
  { id: 'politics', label: 'Politics', icon: TrendingUp },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'technology', label: 'Technology', icon: TrendingUp },
  { id: 'entertainment', label: 'Entertainment', icon: TrendingUp },
  { id: 'sports', label: 'Sports', icon: TrendingUp },
]

const BBC_NEWS_CATEGORIES = [
  { id: 'front_page', label: 'Front Page', icon: Newspaper },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'politics', label: 'Politics', icon: TrendingUp },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'technology', label: 'Technology', icon: TrendingUp },
  { id: 'entertainment', label: 'Entertainment', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: TrendingUp },
  { id: 'education', label: 'Education', icon: TrendingUp },
  { id: 'england', label: 'England', icon: TrendingUp },
  { id: 'scotland', label: 'Scotland', icon: TrendingUp },
  { id: 'wales', label: 'Wales', icon: TrendingUp },
  { id: 'in_depth', label: 'In Depth', icon: TrendingUp },
]

// Removed NewsSkeleton - now using NewsGridSkeleton component

// Removed NewsCard - now using PremiumNewsCard component

export default function LiveNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSource, setSelectedSource] = useState('sky-news')
  const [selectedCategory, setSelectedCategory] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = async (source: string = selectedSource, category: string = selectedCategory, query: string = searchQuery, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        category,
        limit: '20'
      })
      
      if (query.trim()) {
        params.append('q', query.trim())
      }

      // Determine API endpoint based on selected source
      const apiEndpoint = source === 'bbc-news' ? '/api/bbc-news-rss' : '/api/sky-news-rss'
      const response = await fetch(`${apiEndpoint}?${params}`)
      const data: NewsResponse = await response.json()

      if (data.success) {
        setArticles(data.data)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch news:', data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setIsOnline(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNews()
    
    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchNews(selectedSource, selectedCategory, searchQuery)
  }, [selectedCategory, selectedSource])

  const handleRefresh = () => {
    fetchNews(selectedSource, selectedCategory, searchQuery, true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNews(selectedSource, selectedCategory, searchQuery)
  }

  const handleSourceChange = (source: string) => {
    setSelectedSource(source)
    // Reset category to default when switching sources
    if (source === 'bbc-news') {
      setSelectedCategory('front_page')
    } else {
      setSelectedCategory('home')
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Get current categories based on selected source
  const getCurrentCategories = () => {
    return selectedSource === 'bbc-news' ? BBC_NEWS_CATEGORIES : SKY_NEWS_CATEGORIES
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent">
                Live News
              </h1>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
              Stay updated with the latest breaking news from Sky News. Real-time updates, verified sources.
            </p>
            
            {/* Status Bar */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "font-medium",
                  isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {isOnline ? 'Live' : 'Offline'}
                </span>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <NotificationService showSettings={true} />
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="mb-8 space-y-6">
            {/* News Source Selector */}
            <div className="flex justify-center">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {NEWS_SOURCES.map((source) => {
                  const Icon = source.icon
                  return (
                    <Button
                      key={source.id}
                      variant={selectedSource === source.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleSourceChange(source.id)}
                      className={cn(
                        "h-10 px-6 text-sm font-medium transition-all rounded-lg",
                        selectedSource === source.id
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {source.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {getCurrentCategories().map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      "h-9 px-4 text-sm font-medium transition-all",
                      selectedCategory === category.id
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </Button>
                )
              })}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9 px-4 text-sm font-medium"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* News Grid */}
          {loading ? (
            <NewsGridSkeleton count={6} />
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <PremiumNewsCard 
                  key={article.id} 
                  article={article} 
                  variant={index === 0 ? 'featured' : 'default'}
                />
              ))}
            </div>
          ) : (
            // No Articles Found
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {!loading && articles.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                className="px-8 py-3 text-base font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Load More News
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
