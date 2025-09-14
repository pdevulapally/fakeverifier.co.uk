"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Clock, 
  ExternalLink, 
  TrendingUp,
  Eye,
  Share2,
  Bookmark
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

interface PremiumNewsCardProps {
  article: NewsArticle
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export function PremiumNewsCard({ 
  article, 
  variant = 'default',
  className 
}: PremiumNewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isShared, setIsShared] = useState(false)
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      home: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      world: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      uk: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      politics: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      business: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      technology: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      entertainment: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      sports: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
    }
    return colors[category as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'text-green-500'
    if (relevance >= 60) return 'text-yellow-500'
    if (relevance >= 40) return 'text-orange-500'
    return 'text-gray-500'
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsShared(true)
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      })
    } else {
      navigator.clipboard.writeText(article.url)
    }
    setTimeout(() => setIsShared(false), 2000)
  }

  const handleCardClick = () => {
    window.open(article.url, '_blank')
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:scale-[1.02] hover:shadow-2xl",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Image */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {article.mediaUrl && !imageError ? (
                <>
                  {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
                  <img
                    src={article.mediaUrl}
                    alt={article.title}
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-slate-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs font-medium flex-shrink-0", getCategoryColor(article.category))}
                >
                  {article.category}
                </Badge>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {article.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'featured') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-800 hover:scale-[1.01] hover:shadow-3xl",
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs font-medium", getCategoryColor(article.category))}
                >
                  {article.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Trending
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-blue-500 text-blue-500" : "text-slate-400")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Share2 className={cn("h-4 w-4", isShared ? "text-green-500" : "text-slate-400")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Featured Image */}
            {article.mediaUrl && !imageError && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
                <img
                  src={article.mediaUrl}
                  alt={article.title}
                  className={cn(
                    "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            
            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
              {article.description}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {article.source}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className={cn("text-sm font-medium", getRelevanceColor(article.relevance))}>
                    {article.relevance}%
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Read
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:scale-[1.02] hover:shadow-2xl",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={cn("text-xs font-medium", getCategoryColor(article.category))}
          >
            {article.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Image */}
          {article.mediaUrl && !imageError && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
              <img
                src={article.mediaUrl}
                alt={article.title}
                className={cn(
                  "h-full w-full object-cover transition-all duration-300 group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
          )}
          
          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {article.description}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {article.source}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-slate-400" />
                <span className={cn("text-xs font-medium", getRelevanceColor(article.relevance))}>
                  {article.relevance}%
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Read
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
