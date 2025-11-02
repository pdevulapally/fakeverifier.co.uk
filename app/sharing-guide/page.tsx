'use client';

import { useRouter } from 'next/navigation';
import {
  Share,
  Lock,
  Globe,
  Link2,
  Eye,
  Shield,
  Sparkles,
  Copy,
  RotateCcw,
  ThumbsUp,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Users,
  Zap,
  Clock,
  MapPin,
  Monitor,
  BarChart3,
  AlertCircle,
  Info,
  Settings,
  TrendingUp,
  FileText,
  Send,
  RefreshCw,
  Download,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SharingGuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b backdrop-blur-lg bg-background/80" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                <Share className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>How Sharing Works</h1>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Learn about our conversation sharing features</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Section */}
          <section className="space-y-4">
            <div className="flex items-start gap-4 p-6 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>What is Sharing?</h2>
                <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Sharing allows you to create a public link to any of your fact-checking conversations. 
                  Anyone with the link can view the conversation, see the verification results with sources, 
                  and even continue the conversation in their own chat to build upon your fact-checking work.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Levels Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Shield className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Privacy Levels
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Choose the level of privacy that fits your needs. You can change this anytime.
            </p>

            <div className="grid gap-4">
              {/* Private */}
              <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <Lock className="h-6 w-6" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Private</h3>
                      <span className="px-2 py-0.5 text-xs rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        Default
                      </span>
                    </div>
                    <p className="mb-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      Only you can see this conversation. No sharing link is generated. Perfect for personal fact-checks 
                      you want to keep confidential or internal research.
                    </p>
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                      <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ color: 'var(--muted-foreground)' }}>Not discoverable by others</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Sharing */}
              <div className="p-6 rounded-xl border-2 relative overflow-hidden" style={{ borderColor: 'var(--primary)', background: 'var(--card)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Link2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Anyone with Link</h3>
                      <span className="px-2 py-0.5 text-xs rounded-md font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                        Recommended
                      </span>
                    </div>
                    <p className="mb-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      Creates a shareable link that anyone can access. The conversation won't appear in public search, 
                      but anyone who has the link can view it, see your verification results, and continue the conversation.
                    </p>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                        <Link2 className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--foreground)' }}>Share via: Copy link, Email, Social Media, QR Code</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                        <Eye className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--foreground)' }}>Access logs show who viewed your conversation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public */}
              <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <Globe className="h-6 w-6" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Public</h3>
                      <span className="px-2 py-0.5 text-xs rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        Community
                      </span>
                    </div>
                    <p className="mb-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      Makes your conversation visible to everyone in the Public Reports section. Other users can discover, 
                      view, like, dislike, and continue your conversations. Great for contributing to the fact-checking community.
                    </p>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                        <Eye className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--foreground)' }}>Visible in: Public Reports Feed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                        <Users className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--foreground)' }}>Community can interact with your conversation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Sparkles className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Key Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { 
                  icon: Copy, 
                  title: 'One-Click Sharing',
                  description: 'Copy shareable links instantly with a single click. Links are automatically formatted for easy sharing.'
                },
                { 
                  icon: Share, 
                  title: 'Native Share Integration',
                  description: 'On mobile devices, use your device\'s built-in share menu to send via any app installed on your phone.'
                },
                { 
                  icon: Eye, 
                  title: 'Access Tracking',
                  description: 'View detailed access logs showing who accessed your shared conversations, when, and from where.'
                },
                { 
                  icon: RotateCcw, 
                  title: 'Continue Conversations',
                  description: 'Recipients can continue your fact-checking work by starting a new conversation based on your shared one.'
                },
                { 
                  icon: ThumbsUp, 
                  title: 'Community Engagement',
                  description: 'Public conversations can be liked or disliked by the community, helping surface quality fact-checks.'
                },
                { 
                  icon: Zap, 
                  title: 'Real-Time Updates',
                  description: 'Any changes you make to a shared conversation are instantly reflected to everyone with access.'
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                      <feature.icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Shield className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Security & Privacy
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="space-y-4">
                <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  You maintain <strong style={{ color: 'var(--foreground)' }}>full control</strong> over your shared conversations. 
                  Here's how we protect your privacy:
                </p>
                <ul className="space-y-3">
                  {[
                    'Change privacy levels anytime from the share modal',
                    'Revoke access by changing privacy to Private',
                    'View detailed access logs showing who accessed your conversations',
                    'Delete shared conversations to remove them permanently',
                    'Your personal information and account details are never shared',
                    'All shared conversations maintain your original fact-checking context'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--muted-foreground)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* How to Use Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <HelpCircle className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              How to Share
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <ol className="space-y-4">
                {[
                  {
                    step: 'Click the Share Button',
                    description: 'On any conversation in your chat history, click the share icon in the top-right corner of the conversation card.'
                  },
                  {
                    step: 'Select Privacy Level',
                    description: 'Choose your preferred privacy level: Private (no sharing), Anyone with Link (shareable link), or Public (visible to everyone).'
                  },
                  {
                    step: 'Copy or Share Link',
                    description: 'Once a link is generated, click the copy button to copy it to your clipboard, or use your device\'s native share feature.'
                  },
                  {
                    step: 'Distribute the Link',
                    description: 'Send the link via email, messaging apps, social media, or any other method. Anyone with the link can access it.'
                  },
                  {
                    step: 'Manage Access',
                    description: 'View access logs, change privacy settings, or revoke access anytime from the share modal.'
                  }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                         style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{item.step}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Link Format Details */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Link2 className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Understanding Share Links
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Link Format</h3>
                  <div className="p-3 rounded-lg font-mono text-sm break-all" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                    https://fakeverifier.co.uk/shared/[conversation-id]
                  </div>
                  <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    Each shared conversation gets a unique, permanent link. The conversation ID is a secure, randomly generated identifier 
                    that can't be guessed or enumerated.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Permanent Links</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Links remain valid as long as the conversation exists and maintains its sharing status. They don't expire automatically.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Secure Access</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Links are cryptographically secure. Only users with the exact link can access the conversation, preventing unauthorized discovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Access Logs Details */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <BarChart3 className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Access Tracking & Analytics
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                When you share a conversation with "Anyone with Link" or "Public" privacy, you gain access to detailed analytics 
                about who has viewed your shared content.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>What Access Logs Track</h3>
                <div className="grid gap-3">
                  {[
                    { icon: Clock, text: 'Timestamp of each access attempt' },
                    { icon: MapPin, text: 'Geographic location (country/city level)' },
                    { icon: Monitor, text: 'Device type and browser information' },
                    { icon: Eye, text: 'Total view count and unique visitors' },
                    { icon: Users, text: 'IP address (for security, not displayed to you)' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                      <item.icon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    <strong style={{ color: 'var(--foreground)' }}>Privacy Note:</strong> Access logs are anonymized and aggregated. 
                    We don't track or store personal information. IP addresses are used only for security purposes and location approximation. 
                    Individual users cannot be identified from access logs alone.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Continue Conversation Feature */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <RotateCcw className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Continue Conversation Feature
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                The "Continue Conversation" feature allows anyone viewing a shared conversation to build upon your fact-checking work 
                by creating their own new conversation with all the context from your shared one.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>How It Works</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li className="leading-relaxed">When someone views your shared conversation, they see a "Continue Conversation" button</li>
                    <li className="leading-relaxed">Clicking this button creates a new conversation in their chat history (if they're logged in) or as a temporary session</li>
                    <li className="leading-relaxed">All messages and verification results from your original conversation are copied into the new conversation</li>
                    <li className="leading-relaxed">They can then ask follow-up questions, request additional fact-checks, or expand on your verification work</li>
                    <li className="leading-relaxed">The new conversation references the original but is completely independent - their additions don't affect your original</li>
                  </ol>
                </div>
                
                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Benefits</p>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Enables collaborative fact-checking and research</li>
                        <li>• Preserves your original work while allowing extensions</li>
                        <li>• Creates a chain of verification building on previous findings</li>
                        <li>• Great for educational purposes - students can build on teacher examples</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Public Reports Feed */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Globe className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Public Reports Feed
            </h2>
            
            <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                When you set a conversation to "Public", it becomes discoverable in the Public Reports section where anyone can browse, 
                search, and interact with fact-checking work from the entire community.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Public Feed Features</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { icon: TrendingUp, text: 'Trending fact-checks based on engagement' },
                      { icon: Search, text: 'Searchable by keywords and topics' },
                      { icon: ThumbsUp, text: 'Community voting (likes/dislikes) for quality' },
                      { icon: Eye, text: 'View counts to see popular verifications' },
                      { icon: RotateCcw, text: 'Continue conversations from public feed' },
                      { icon: Share, text: 'Share public reports further with one click' }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                        <feature.icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Community Benefits</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        By making your fact-checks public, you contribute to a collective knowledge base that helps combat misinformation 
                        at scale. High-quality verifications get surfaced through community engagement, helping others find reliable information faster.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Sparkles className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Best Practices & Tips
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  Do's
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>Review access logs periodically to understand your audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>Use descriptive titles for better discoverability in public feed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>Share completed fact-checks with all sources and evidence included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>Update privacy settings if a conversation becomes outdated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>Share fact-checks on relevant topics to help the community</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <AlertCircle className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
                  Don'ts
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✗</span>
                    <span>Don't share conversations containing personal or sensitive information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✗</span>
                    <span>Don't make incomplete or unverified claims public</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✗</span>
                    <span>Avoid sharing test conversations or incomplete verifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✗</span>
                    <span>Don't forget to review access logs for suspicious activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✗</span>
                    <span>Don't share links without understanding the privacy level</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Common Use Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Journalism & Research',
                  description: 'Share fact-checked articles and research findings with colleagues, editors, or the public. Create link-only shares for peer review or make public for transparency.',
                  tips: ['Use link sharing for editorial review', 'Go public for transparency in reporting', 'Include all sources for credibility']
                },
                {
                  title: 'Education',
                  description: 'Teachers can share fact-checking examples with students to teach media literacy. Students can continue conversations to explore topics deeper.',
                  tips: ['Create classroom examples', 'Let students continue conversations', 'Build critical thinking skills']
                },
                {
                  title: 'Social Media',
                  description: 'Share verification results on Twitter, Facebook, or other platforms to combat misinformation. Quick link sharing makes it easy to spread verified facts.',
                  tips: ['Use link-only for targeted sharing', 'Make public for broader reach', 'Include verdict in social media post']
                },
                {
                  title: 'Collaboration',
                  description: 'Teams can share fact-checks internally or with partners to build comprehensive reports. Access logs help track who reviewed what.',
                  tips: ['Share via link for internal teams', 'Track access for accountability', 'Build on each other\'s work']
                },
                {
                  title: 'Public Advocacy',
                  description: 'Make fact-checks public to support public discourse on important topics. High-quality verifications can influence public understanding.',
                  tips: ['Use public setting for maximum reach', 'Engage with community feedback', 'Build credibility over time']
                },
                {
                  title: 'Academic Research',
                  description: 'Researchers can share verification methods and findings with peers. Public sharing enables transparency and reproducibility in fact-checking research.',
                  tips: ['Include methodology details', 'Cite sources properly', 'Enable peer review through sharing']
                }
              ].map((useCase, idx) => (
                <div key={idx} className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{useCase.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>{useCase.description}</p>
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Tips:</p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--muted-foreground)' }}>
                      {useCase.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-1.5">
                          <span className="mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <HelpCircle className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-3">
              {[
                {
                  q: 'Can I change the privacy level after sharing?',
                  a: 'Yes! You can change privacy levels anytime from the share modal. Switching to Private will immediately revoke access for anyone with the link. Changing from Public to Link-only removes it from public feed but keeps the link active.'
                },
                {
                  q: 'What happens if I delete a shared conversation?',
                  a: 'Deleting a shared conversation permanently removes it. All links become invalid, and it disappears from public feeds. Anyone trying to access the link will see a "not found" message. This action cannot be undone.'
                },
                {
                  q: 'Can I see who accessed my shared conversation?',
                  a: 'For "Anyone with Link" and "Public" conversations, yes. You can view access logs showing timestamps, approximate locations, device types, and view counts. This helps you understand your audience while maintaining privacy.'
                },
                {
                  q: 'Do I need to be logged in to share?',
                  a: 'Yes, you need to be logged in to create and manage shared conversations. However, anyone with a link can view shared conversations without logging in.'
                },
                {
                  q: 'Can I share multiple conversations at once?',
                  a: 'Currently, sharing is done one conversation at a time. Each conversation gets its own unique link. You can share multiple links in a single message or post if needed.'
                },
                {
                  q: 'What\'s the difference between link sharing and public sharing?',
                  a: 'Link sharing creates a unique URL that only works if someone has the exact link. Public sharing makes your conversation discoverable in the public reports feed, searchable, and visible to anyone browsing.'
                },
                {
                  q: 'Can someone edit my shared conversation?',
                  a: 'No. Others cannot edit your original conversation. They can only view it or use the "Continue Conversation" feature to create their own new conversation based on yours.'
                },
                {
                  q: 'How long do shared links remain active?',
                  a: 'Shared links remain active indefinitely as long as: (1) the conversation exists, (2) you haven\'t deleted it, (3) the privacy level allows access, and (4) you haven\'t revoked sharing.'
                },
                {
                  q: 'Can I track if my shared link was forwarded?',
                  a: 'Access logs show when someone accesses your conversation, but you cannot see who forwarded the link or how it was distributed. Each access is tracked independently.'
                },
                {
                  q: 'Are shared conversations indexed by search engines?',
                  a: 'Only Public conversations may be indexed by search engines. Link-only shared conversations are not discoverable through search engines, only through the direct link.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                  <h3 className="font-semibold mb-2 flex items-start gap-2" style={{ color: 'var(--foreground)' }}>
                    <span className="text-lg" style={{ color: 'var(--primary)' }}>Q{idx + 1}:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm leading-relaxed ml-7" style={{ color: 'var(--muted-foreground)' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Advanced Features */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Settings className="h-7 w-7" style={{ color: 'var(--primary)' }} />
              Advanced Features & Settings
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: RefreshCw,
                  title: 'Privacy Level Changes',
                  description: 'Switch between privacy levels instantly. Changes take effect immediately and are reflected to all viewers.'
                },
                {
                  icon: Eye,
                  title: 'Access Management',
                  description: 'View and manage access logs. Remove specific access entries if needed (for link-only sharing).'
                },
                {
                  icon: FileText,
                  title: 'Conversation Details',
                  description: 'All original messages, verification results, sources, and metadata are preserved in shared conversations.'
                },
                {
                  icon: Send,
                  title: 'Quick Share Actions',
                  description: 'One-click copy, native share menu integration, and QR code generation for easy distribution.'
                },
                {
                  icon: Download,
                  title: 'Export Options',
                  description: 'Shared conversations maintain full formatting, sources, and citations for easy reference.'
                },
                {
                  icon: BarChart3,
                  title: 'Analytics Dashboard',
                  description: 'Track views, engagement, and access patterns to understand how your fact-checks are being used.'
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                      <feature.icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer CTA */}
          <div className="p-6 rounded-xl border text-center" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <Share className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--primary)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Ready to Share?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Go back to your conversations and start sharing your fact-checks with the world!
            </p>
            <Button
              onClick={() => router.push('/verify')}
              className="px-6"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Go to Conversations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

