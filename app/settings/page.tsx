"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Shield, Download, Trash2, Save, CreditCard, AlertTriangle, LogOut, Crown, Zap, Settings, Lock, Eye, EyeOff, CheckCircle, XCircle, Star, Globe, Database, ShieldCheck, Smartphone, Mail, Calendar, TrendingUp, Users, BarChart3, Activity } from "lucide-react";
import { useToast } from "@/components/ui/toast";

// Inline Badge component
const Badge = ({ children, className, style, variant = "default" }: any) => {
  const variants: Record<string, string> = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    primary: "bg-blue-100 text-blue-800"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className || ''}`} style={style}>
      {children}
    </span>
  );
};

// Enhanced Switch component
const Switch = ({ id, checked, onCheckedChange, disabled = false }: { id?: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    id={id}
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={() => !disabled && onCheckedChange(!checked)}
    disabled={disabled}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Enhanced Input component
const Input = ({ id, value, onChange, type, placeholder, className, disabled = false }: { id?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; className?: string; disabled?: boolean }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
  />
);

// Enhanced Label component
const Label = ({ htmlFor, children, className, required = false }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium ${className || ''}`} style={{ color: 'var(--foreground)' }}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// Enhanced Dialog components
const Dialog = ({ open, onOpenChange, children }: any) => 
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  ) : null;

const DialogContent = ({ children, className }: any) => (
  <div className={`relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl ${className || ''}`} style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
    {children}
  </div>
);

const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const DialogFooter = ({ children, className }: any) => <div className={`mt-6 flex justify-end gap-3 ${className || ''}`}>{children}</div>;
const DialogTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`} style={{ color: 'var(--foreground)' }}>{children}</h3>;
const DialogDescription = ({ children, className }: any) => <p className={`text-sm ${className || ''}`} style={{ color: 'var(--muted-foreground)' }}>{children}</p>;

// Toast hook
const useSettingsToast = () => {
  const t = useToast();
  return {
    success: (msg: string) => t.success(msg),
    error: (msg: string) => t.error(msg),
  };
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const toast = useSettingsToast();

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    bio: "",
  });

  const [plan, setPlan] = useState<string>("free");
  const [userTokens, setUserTokens] = useState({ used: 0, daily: 0, monthly: 0 });

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      verificationComplete: true,
      lowTokens: true,
      weeklyReport: false,
      marketing: false,
    },
    privacy: {
      shareAnalytics: true,
      allowCookies: true,
      publicProfile: false,
      showActivity: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true,
    },
  });

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    (async () => {
      try {
        setProfileData({
          displayName: user.name || user.email || "User",
          email: user.email || "",
          phoneNumber: "",
          bio: "",
        });
        
        // Fetch user plan
        const planRes = await fetch(`/api/user-plan?uid=${user.uid}`);
        const planData = await planRes.json();
        if (planRes.ok) setPlan(planData.plan || "free");

        // Fetch user tokens
        const tokenRes = await fetch(`/api/user-tokens?uid=${user.uid}`);
        const tokenData = await tokenRes.json();
        if (tokenRes.ok) {
          setUserTokens({
            used: tokenData.raw?.used || 0,
            daily: tokenData.limitsDaily || 0,
            monthly: tokenData.limitsMonthly || 0
          });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch {}
  };

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    toast.success("Profile updated successfully");
  };

  const handleCancelEdit = () => {
    setProfileData({
      displayName: user?.name || user?.email || "User",
      email: user?.email || "",
      phoneNumber: "",
      bio: "",
    });
    setIsEditingProfile(false);
  };

  const getAccountTypeBadge = (p: string) => {
    if (p === "pro") return <Badge variant="primary">PRO</Badge>;
    if (p === "enterprise") return <Badge variant="warning">ENTERPRISE</Badge>;
    return <Badge variant="default">FREE</Badge>;
  };

  const getAccountTypeIcon = (p: string) => {
    if (p === "pro") return <Crown className="w-4 h-4" style={{ color: "var(--primary)" }} />;
    if (p === "enterprise") return <Zap className="w-4 h-4" style={{ color: "var(--accent)" }} />;
    return <User className="w-4 h-4" />;
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [key]: value },
    }));
  };

  async function handleExportData() {
    if (!user) return;
    setIsExporting(true);
    try {
      const convRes = await fetch(`/api/conversations?uid=${user.uid}`);
      const convJson = await convRes.json();
      const conversations = convJson.conversations || [];
      let csv = "CONVERSATIONS\nID,Title,Created,Updated\n";
      for (const c of conversations) {
        csv += `${c.id},"${(c.title || "").replace(/"/g, '""')}","${c.createdAt || ''}","${c.updatedAt || ''}"\n`;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fakeverifier-export-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleClearHistory() {
    if (!user) return;
    if (!confirm("Clear all conversations? This action cannot be undone.")) return;
    setIsClearingHistory(true);
    try {
      const convRes = await fetch(`/api/conversations?uid=${user.uid}`);
      const convJson = await convRes.json();
      const conversations = convJson.conversations || [];
      for (const c of conversations) {
        await fetch(`/api/conversations?id=${c.id}&uid=${user.uid}`, { method: "DELETE" });
      }
      toast.success("History cleared successfully");
    } catch {
      toast.error("Failed to clear history");
    } finally {
      setIsClearingHistory(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setIsDeleting(true);
    try {
      const r = await fetch("/api/account", { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ uid: user.uid }) 
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      window.location.href = "/login";
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  const getUserInitials = (u: any) => {
    if (u?.name) return u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    if (u?.email) return (u.email[0] || "U").toUpperCase();
    return "U";
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data', icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--primary)' }} />
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0.1s' }} />
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0.2s' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="border-b sticky top-0 z-40" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/verify">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Verify</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-3 gap-2 p-1 rounded-lg border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
              {tabs.slice(0, 6).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      background: activeTab === tab.id ? 'var(--card)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{
                      background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
          <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Profile Information</h2>
              </div>
              {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {!isEditingProfile ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Profile Header - Mobile Optimized */}
                <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-semibold flex-shrink-0" style={{ background: 'var(--muted)' }}>
                    {user?.avatar ? (
                          <img src={user.avatar} alt={user.name || 'User'} className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover" />
                    ) : (
                          <span style={{ color: 'var(--primary)' }}>{getUserInitials(user)}</span>
                    )}
                  </div>
                      <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base sm:text-lg lg:text-xl truncate" style={{ color: 'var(--foreground)' }}>{user?.name || 'User'}</h3>
                      {getAccountTypeBadge(plan)}
                    </div>
                        <p className="text-sm sm:text-base truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="success" className="text-xs">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Account Stats - Mobile Optimized */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{userTokens.used || 0}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{userTokens.daily || 0}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Daily</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{userTokens.monthly || 0}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Monthly</div>
                  </div>
                </div>

                    {/* Profile Details - Mobile Optimized */}
                    <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                      <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <Label className="text-sm">Display Name</Label>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user?.name || 'Not set'}</p>
                  </div>
                      <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <Label className="text-sm">Email</Label>
                        <p className="text-sm font-medium truncate ml-2" style={{ color: 'var(--foreground)' }}>{user?.email}</p>
                  </div>
                      <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <Label className="text-sm">Phone</Label>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Not set</p>
                  </div>
                      <div className="flex justify-between items-center py-2">
                        <Label className="text-sm">Plan</Label>
                    <div className="flex items-center gap-2">
                      {getAccountTypeIcon(plan)}
                          <p className="capitalize text-sm font-medium" style={{ color: 'var(--foreground)' }}>{plan || 'free'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                  <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                        <Label htmlFor="displayName" required>Display Name</Label>
                    <Input id="displayName" value={profileData.displayName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, displayName: e.target.value }))} placeholder="Enter your display name" />
                  </div>
                  <div>
                        <Label htmlFor="email" required>Email</Label>
                    <Input id="email" type="email" value={profileData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, email: e.target.value }))} placeholder="Enter your email" />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" value={profileData.phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="Enter your phone number" />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" value={profileData.bio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself" />
                  </div>
                </div>
                    <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button onClick={handleSaveProfile} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
          <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Billing & Subscription</h2>
              </div>
                
                <div className="space-y-6">
                  {/* Current Plan - Mobile Optimized */}
                  <div className="p-4 rounded-lg border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getAccountTypeIcon(plan)}
                        <div>
                          <h3 className="font-semibold capitalize text-sm" style={{ color: 'var(--foreground)' }}>{plan || 'free'} Plan</h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current subscription</p>
                        </div>
                      </div>
                      {getAccountTypeBadge(plan)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Label className="text-xs">Cost</Label>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {plan === 'free' ? 'Free' : plan === 'pro' ? '$9.99' : plan === 'enterprise' ? '$49.99' : 'Free'}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-xs">Verifications</Label>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {plan === 'free' ? '5/day' : '∞'}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-xs">Images</Label>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {plan === 'free' ? '1' : plan === 'pro' ? '5' : '10'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options - Mobile Optimized */}
                  {plan === 'free' && (
                    <div className="p-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--primary)' }}>
                      <div className="text-center">
                        <Crown className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>Upgrade to Pro</h3>
                        <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Unlimited verifications</p>
                        <Link href="/pricing">
                          <Button className="w-full" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade
                </Button>
              </Link>
            </div>
                    </div>
                  )}

                  {/* Billing History */}
                  <div>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Billing History</h3>
                    <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      No billing history available
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5" style={{ color: 'var(--success, #16a34a)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Notification Preferences</h2>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="email-notifications" className="text-sm sm:text-base">Email Notifications</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Receive notifications via email</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="email-notifications" checked={settings.notifications.email} onCheckedChange={(c: boolean) => updateSetting('notifications', 'email', c)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="push-notifications" className="text-sm sm:text-base">Push Notifications</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Receive notifications in browser</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="push-notifications" checked={settings.notifications.push} onCheckedChange={(c: boolean) => updateSetting('notifications', 'push', c)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--success, #16a34a)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="verification-complete" className="text-sm sm:text-base">Verification Complete</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Notify when verification is finished</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="verification-complete" checked={settings.notifications.verificationComplete} onCheckedChange={(c: boolean) => updateSetting('notifications', 'verificationComplete', c)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--warning, #f59e0b)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="low-tokens" className="text-sm sm:text-base">Low Token Alerts</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Notify when running low on tokens</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="low-tokens" checked={settings.notifications.lowTokens} onCheckedChange={(c: boolean) => updateSetting('notifications', 'lowTokens', c)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="weekly-report" className="text-sm sm:text-base">Weekly Reports</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Receive weekly usage summaries</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="weekly-report" checked={settings.notifications.weeklyReport} onCheckedChange={(c: boolean) => updateSetting('notifications', 'weeklyReport', c)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <div className="min-w-0">
                          <Label htmlFor="marketing" className="text-sm sm:text-base">Marketing Updates</Label>
                          <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>Receive product updates and tips</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Switch id="marketing" checked={settings.notifications.marketing} onCheckedChange={(c: boolean) => updateSetting('notifications', 'marketing', c)} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Privacy & Data</h2>
                </div>
                
                <div className="space-y-6">
            <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        <div>
                          <Label htmlFor="share-analytics">Share Analytics</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Help improve our service with anonymous usage data</p>
                        </div>
                      </div>
                      <Switch id="share-analytics" checked={settings.privacy.shareAnalytics} onCheckedChange={(c: boolean) => updateSetting('privacy', 'shareAnalytics', c)} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        <div>
                          <Label htmlFor="allow-cookies">Allow Cookies</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Enable cookies for better experience</p>
                        </div>
                      </div>
                      <Switch id="allow-cookies" checked={settings.privacy.allowCookies} onCheckedChange={(c: boolean) => updateSetting('privacy', 'allowCookies', c)} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <div>
                          <Label htmlFor="public-profile">Public Profile</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Make your profile visible to other users</p>
                  </div>
                </div>
                      <Switch id="public-profile" checked={settings.privacy.publicProfile} onCheckedChange={(c: boolean) => updateSetting('privacy', 'publicProfile', c)} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        <div>
                          <Label htmlFor="show-activity">Show Activity</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Display your recent activity to others</p>
                </div>
              </div>
                      <Switch id="show-activity" checked={settings.privacy.showActivity} onCheckedChange={(c: boolean) => updateSetting('privacy', 'showActivity', c)} />
                    </div>
              </div>
            </div>
          </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
          <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Security Settings</h2>
            </div>
                
                <div className="space-y-6">
            <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <div>
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Add an extra layer of security to your account</p>
                        </div>
                </div>
                      <Switch id="two-factor" checked={settings.security.twoFactor} onCheckedChange={(c: boolean) => updateSetting('security', 'twoFactor', c)} />
              </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <div>
                          <Label htmlFor="login-alerts">Login Alerts</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Get notified of new login attempts</p>
                        </div>
                </div>
                      <Switch id="login-alerts" checked={settings.security.loginAlerts} onCheckedChange={(c: boolean) => updateSetting('security', 'loginAlerts', c)} />
              </div>

                    <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <div>
                          <Label htmlFor="session-timeout">Session Timeout</Label>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Automatically sign out after inactivity</p>
                </div>
              </div>
                      <select 
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={0}>Never</option>
                      </select>
                </div>
              </div>
            </div>
          </Card>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
          <Card className="p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Data Management</h2>
            </div>
                  
            <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting} className="hover:bg-gray-100 w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
                      <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={isClearingHistory} className="text-red-600 hover:bg-red-50 w-full sm:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isClearingHistory ? 'Clearing...' : 'Clear History'}
                </Button>
              </div>
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Export your data or clear your verification history. Clearing history will permanently delete all records.
                    </p>
            </div>
          </Card>

          {/* Danger Zone */}
                <Card className="p-4 sm:p-6" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#dc2626' }} />
                    <h2 className="text-base sm:text-lg font-semibold" style={{ color: '#7f1d1d' }}>Danger Zone</h2>
            </div>
            <div className="space-y-4">
              <div>
                      <p className="text-xs sm:text-sm mb-4" style={{ color: '#b91c1c' }}>
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full sm:w-auto" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-full max-w-sm sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#dc2626' }}>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="w-full sm:w-auto" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
