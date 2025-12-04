"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, User, Bell, Shield, Download, Trash2, Save, CreditCard, AlertTriangle, LogOut, Crown, Zap, Settings, Lock, Eye, EyeOff, CheckCircle, XCircle, Star, Globe, Database, ShieldCheck, Smartphone, Mail, Calendar, TrendingUp, Users, BarChart3, Activity, Edit } from "lucide-react";
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

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
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
  const [userTokens, setUserTokens] = useState({ 
    used: 0, 
    daily: 0, 
    monthly: 0,
    limitsDaily: 0,
    limitsMonthly: 0,
    total: 0,
    extraTokens: 0,
    plan: 'free',
    isUnlimited: false
  });
  const [nextRefillDate, setNextRefillDate] = useState<string | null>(null);

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
    if (!open || !user) return;
    
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
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tokenRes = await fetch(`/api/user-tokens?uid=${user.uid}&t=${Date.now()}&tz=${encodeURIComponent(tz)}`, { cache: 'no-store' });
        const tokenData = await tokenRes.json();
        if (tokenRes.ok) {
          // Use plan from token response (most accurate) or fallback to plan from user-plan API
          const tokenPlan = tokenData.plan || planData.plan || 'free';
          if (tokenPlan && tokenPlan !== plan) {
            setPlan(tokenPlan);
          }
          
          const dailyRemaining = tokenData.tokensDaily ?? 0;
          const monthlyRemaining = tokenData.tokensMonthly ?? 0;
          const limitsDaily = tokenData.limitsDaily ?? 0;
          const limitsMonthly = tokenData.limitsMonthly ?? 0;
          
          // For enterprise plan (unlimited), handle display differently
          const isEnterprise = tokenPlan === 'enterprise';
          const hasUnlimitedLimits = limitsDaily === Number.MAX_SAFE_INTEGER || limitsMonthly === Number.MAX_SAFE_INTEGER;
          const isUnlimited = isEnterprise || hasUnlimitedLimits;
          
          // Calculate extra tokens: tokens beyond the monthly limit (unused tokens from previous billing cycles)
          // If monthlyRemaining exceeds limitsMonthly, the excess is extra tokens
          // For enterprise/unlimited, don't calculate extra tokens
          const extraTokens = isUnlimited ? 0 : Math.max(0, monthlyRemaining - limitsMonthly);
          
          // Monthly tokens displayed should be capped at the limit for display purposes
          // For enterprise/unlimited, set to a special value to indicate unlimited
          const monthlyDisplay = isUnlimited ? Number.MAX_SAFE_INTEGER : Math.min(monthlyRemaining, limitsMonthly);
          
          // Total tokens = monthly (capped) + extra + daily
          // For enterprise, set to unlimited indicator
          const totalTokens = isUnlimited 
            ? Number.MAX_SAFE_INTEGER
            : monthlyDisplay + extraTokens + dailyRemaining;
          
          setUserTokens({
            used: tokenData.raw?.used || 0,
            daily: isUnlimited ? Number.MAX_SAFE_INTEGER : dailyRemaining,
            monthly: monthlyDisplay,
            limitsDaily: isUnlimited ? Number.MAX_SAFE_INTEGER : limitsDaily,
            limitsMonthly: isUnlimited ? Number.MAX_SAFE_INTEGER : limitsMonthly,
            total: totalTokens,
            extraTokens: extraTokens,
            plan: tokenPlan,
            isUnlimited: isUnlimited
          });
          
          // Calculate next refill date (first day of next month)
          // Skip for enterprise/unlimited plans
          if (!isUnlimited) {
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            setNextRefillDate(nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
          } else {
            setNextRefillDate(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [open, user]);

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

  const formatTokenAmount = (amount: number, showDecimal: boolean = false): string => {
    // Handle unlimited (enterprise plan)
    if (amount === Number.MAX_SAFE_INTEGER || amount >= Number.MAX_SAFE_INTEGER - 1000) {
      return 'Unlimited';
    }
    if (amount >= 1000000) {
      const value = amount / 1000000;
      return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      const value = amount / 1000;
      // Show one decimal place if needed or if showDecimal is true
      if (showDecimal || value % 1 !== 0) {
        return `${value.toFixed(1)}K`;
      }
      return `${value.toFixed(0)}K`;
    }
    return amount.toString();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data', icon: Database },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl bg-white sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Settings</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {activeTab === 'billing' && (
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Manage billing</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full animate-bounce bg-blue-600" />
                    <div className="w-3 h-3 rounded-full animate-bounce bg-blue-600" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 rounded-full animate-bounce bg-blue-600" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <p className="text-sm text-gray-500">Loading settings...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="hidden lg:block w-48 flex-shrink-0">
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
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Mobile Tab Navigation */}
                <div className="lg:hidden mb-4">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 rounded-lg border border-gray-200 bg-gray-50">
                    {tabs.slice(0, 6).map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex flex-col items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-2 sm:py-3 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-white shadow-sm text-blue-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs leading-tight text-center">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Premium Profile Header Card */}
                      <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            {/* Premium Avatar with Ring */}
                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-2 sm:ring-4 ring-blue-100 ring-offset-1 sm:ring-offset-2">
                                {user?.avatar ? (
                                  <img src={user.avatar} alt={user.name || 'User'} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover" />
                                ) : (
                                  <span className="text-white">{getUserInitials(user)}</span>
                                )}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-green-500 rounded-full border-2 sm:border-4 border-white flex items-center justify-center">
                                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-900 truncate">{user?.name || 'User'}</h3>
                                {getAccountTypeBadge(plan)}
                              </div>
                              <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 truncate">{user?.email}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <Badge variant="success" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                  <span className="hidden xs:inline">Verified Account</span>
                                  <span className="xs:hidden">Verified</span>
                                </Badge>
                                <span className="text-[10px] sm:text-xs text-gray-500">Active member</span>
                              </div>
                            </div>
                          </div>
                          {!isEditingProfile && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setIsEditingProfile(true)}
                              className="border-2 hover:bg-blue-50 hover:border-blue-300 transition-all w-full sm:w-auto text-xs sm:text-sm"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Edit Profile
                            </Button>
                          )}
                        </div>
                      </Card>

                      {!isEditingProfile ? (
                        <>
                          {/* Premium Stats Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <Card className="p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 rounded-lg bg-blue-50">
                                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{userTokens.used?.toLocaleString() || 0}</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-600">Tokens Used</div>
                              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">All time</div>
                            </Card>
                            <Card className="p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 rounded-lg bg-green-50">
                                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                {userTokens.isUnlimited ? 'Unlimited' : formatTokenAmount(userTokens.daily)}
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-gray-600">Daily Available</div>
                              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {userTokens.isUnlimited ? 'No daily limits' : 'Resets daily'}
                              </div>
                            </Card>
                            <Card className="p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all sm:col-span-2 md:col-span-1">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 rounded-lg bg-purple-50">
                                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                </div>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                {userTokens.isUnlimited ? 'Unlimited' : formatTokenAmount(userTokens.monthly)}
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-gray-600">Monthly Available</div>
                              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {userTokens.isUnlimited ? 'No monthly limits' : 'Resets monthly'}
                              </div>
                            </Card>
                          </div>

                          {/* Premium Profile Details Card */}
                          <Card className="p-4 sm:p-5 md:p-6 border-2 border-gray-100">
                            <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Account Details</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-1">
                                <Label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</Label>
                                <p className="text-sm sm:text-base font-medium text-gray-900 mt-1 break-words">{user?.name || 'Not set'}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                                <p className="text-sm sm:text-base font-medium text-gray-900 mt-1 break-all">{user?.email || 'Not set'}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</Label>
                                <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">{profileData.phoneNumber || 'Not set'}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscription Plan</Label>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {getAccountTypeIcon(plan)}
                                  <p className="text-sm sm:text-base font-semibold capitalize text-gray-900">{plan || 'free'}</p>
                                  {plan === 'free' && (
                                    <Button 
                                      size="sm" 
                                      className="h-6 text-[10px] sm:text-xs px-2 bg-blue-600 text-white hover:bg-blue-700"
                                      onClick={() => window.location.href = '/pricing'}
                                    >
                                      Upgrade
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </>
                      ) : (
                        <Card className="p-4 sm:p-5 md:p-6 border-2 border-gray-100">
                          <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Edit Profile</h3>
                          </div>
                          <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="displayName" required className="text-xs sm:text-sm font-semibold">Display Name</Label>
                                <Input 
                                  id="displayName" 
                                  value={profileData.displayName} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, displayName: e.target.value }))} 
                                  placeholder="Enter your display name"
                                  className="h-10 sm:h-11 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email" required className="text-xs sm:text-sm font-semibold">Email Address</Label>
                                <Input 
                                  id="email" 
                                  type="email" 
                                  value={profileData.email} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, email: e.target.value }))} 
                                  placeholder="Enter your email"
                                  className="h-10 sm:h-11 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-semibold">Phone Number</Label>
                                <Input 
                                  id="phoneNumber" 
                                  value={profileData.phoneNumber} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, phoneNumber: e.target.value }))} 
                                  placeholder="Enter your phone number"
                                  className="h-10 sm:h-11 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bio" className="text-xs sm:text-sm font-semibold">Bio</Label>
                                <Input 
                                  id="bio" 
                                  value={profileData.bio} 
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, bio: e.target.value }))} 
                                  placeholder="Tell us about yourself"
                                  className="h-10 sm:h-11 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                              <Button 
                                onClick={handleSaveProfile} 
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 sm:px-6 h-10 sm:h-11 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                              >
                                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Save Changes
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={handleCancelEdit}
                                className="px-4 sm:px-6 h-10 sm:h-11 text-sm sm:text-base border-2 hover:bg-gray-50 w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Billing Tab */}
                  {activeTab === 'billing' && (
                    <div className="space-y-6">
                      {/* Subscription & Tokens Overview */}
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Subscription & Tokens</h2>
                          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden md:inline">Manage billing</span>
                          </Button>
                        </div>

                        {/* Next Refill Info */}
                        {nextRefillDate && !userTokens.isUnlimited && userTokens.limitsMonthly > 0 && userTokens.limitsMonthly !== Number.MAX_SAFE_INTEGER && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                            Your next token refill of <strong>{formatTokenAmount(userTokens.limitsMonthly)} tokens</strong> is due on <strong>{nextRefillDate}</strong>.
                          </p>
                        )}
                        
                        {/* Enterprise Plan Notice */}
                        {userTokens.isUnlimited && (
                          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                              <p className="text-xs sm:text-sm font-medium text-purple-900">
                                Enterprise Plan: Unlimited tokens available
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Current Token Balance - Large Display */}
                        <div className="mb-4 sm:mb-6">
                          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {userTokens.isUnlimited ? 'Unlimited' : formatTokenAmount(userTokens.total)}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Current token balance</p>
                        </div>

                        {/* Monthly Tokens */}
                        {!userTokens.isUnlimited && userTokens.monthly !== Number.MAX_SAFE_INTEGER && userTokens.limitsMonthly !== Number.MAX_SAFE_INTEGER && (
                          <div className="mb-3 sm:mb-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                {formatTokenAmount(userTokens.monthly, true)}/{formatTokenAmount(userTokens.limitsMonthly)} monthly tokens
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                                {userTokens.limitsMonthly > 0 && userTokens.limitsMonthly !== Number.MAX_SAFE_INTEGER
                                  ? `${Math.round((userTokens.monthly / userTokens.limitsMonthly) * 100)}%`
                                  : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-1">
                              <div 
                                className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, userTokens.limitsMonthly > 0 && userTokens.limitsMonthly !== Number.MAX_SAFE_INTEGER ? (userTokens.monthly / userTokens.limitsMonthly) * 100 : 0)}%` }}
                              />
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                              Unused tokens expire {nextRefillDate || 'at the end of the month'}.
                            </p>
                          </div>
                        )}
                        
                        {/* Enterprise Monthly Tokens Display */}
                        {userTokens.isUnlimited && (
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                Monthly tokens: Unlimited
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                              <div className="bg-purple-600 h-2 sm:h-2.5 rounded-full" style={{ width: '100%' }} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">No limits on monthly usage</p>
                          </div>
                        )}

                        {/* Extra Tokens (if any) */}
                        {userTokens.extraTokens > 0 && (
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                {userTokens.extraTokens.toLocaleString()} extra tokens
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                              <div 
                                className="bg-green-500 h-2 sm:h-2.5 rounded-full"
                                style={{ width: '100%' }}
                              />
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Never expiring.</p>
                          </div>
                        )}

                        {/* Daily Limit */}
                        {!userTokens.isUnlimited ? (
                          <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                Daily limit: {userTokens.daily.toLocaleString()}/{userTokens.limitsDaily.toLocaleString()} tokens
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                                {userTokens.limitsDaily > 0 && userTokens.limitsDaily !== Number.MAX_SAFE_INTEGER
                                  ? `${Math.round((userTokens.daily / userTokens.limitsDaily) * 100)}%`
                                  : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                              <div 
                                className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, userTokens.limitsDaily > 0 && userTokens.limitsDaily !== Number.MAX_SAFE_INTEGER ? (userTokens.daily / userTokens.limitsDaily) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 sm:mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                Daily limit: Unlimited
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                              <div className="bg-purple-600 h-2 sm:h-2.5 rounded-full" style={{ width: '100%' }} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">No daily limits</p>
                          </div>
                        )}
                      </div>

                      {/* Upgrade/Downgrade Section - Only show for free and enterprise users */}
                      {(plan === 'free' || plan === 'enterprise') && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                          {/* Left Column - Upgrade/Downgrade Form */}
                          <div className="lg:col-span-2">
                            <Card className="p-4 sm:p-5 md:p-6">
                              {plan === 'free' ? (
                                <>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Upgrade to Pro</h3>
                                  
                                  <div className="space-y-3 sm:space-y-4">
                                    <div>
                                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">£9.99 per month</p>
                                      <p className="text-xs sm:text-sm text-gray-500">Billed monthly • Cancel anytime</p>
                                    </div>

                                    <div className="pt-2">
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        Your current plan: <span className="font-medium capitalize">{plan || 'Free'}</span>
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                                        Upgrade to get 2,000 monthly tokens and 200 daily verifications
                                      </p>
                                    </div>

                                    <Button 
                                      className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 sm:py-2.5 text-sm sm:text-base"
                                      onClick={() => window.location.href = '/pricing'}
                                    >
                                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                      Upgrade to Pro
                                    </Button>
                                    
                                    <p className="text-[10px] sm:text-xs text-center text-gray-500">
                                      Or <a href="/pricing" className="text-blue-600 hover:underline">view all plans</a> including Enterprise
                                    </p>
                                  </div>
                                </>
                              ) : plan === 'enterprise' ? (
                                <>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Downgrade to Pro</h3>
                                  
                                  <div className="space-y-3 sm:space-y-4">
                                    <div>
                                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">£9.99 per month</p>
                                      <p className="text-xs sm:text-sm text-gray-500">Billed monthly • Cancel anytime</p>
                                    </div>

                                    <div className="pt-2">
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        Your current plan: <span className="font-medium capitalize">{plan || 'Enterprise'}</span>
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                                        Downgrade to Pro plan with 2,000 monthly tokens and 200 daily verifications
                                      </p>
                                    </div>

                                    <Button 
                                      className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 sm:py-2.5 text-sm sm:text-base"
                                      onClick={() => window.location.href = '/pricing'}
                                    >
                                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                      Downgrade to Pro
                                    </Button>
                                    
                                    <p className="text-[10px] sm:text-xs text-center text-gray-500">
                                      Contact support to manage your Enterprise plan
                                    </p>
                                  </div>
                                </>
                              ) : null}
                            </Card>
                          </div>

                          {/* Right Column - Features List */}
                          <div className="lg:col-span-1">
                            <Card className="p-4 sm:p-5 md:p-6 bg-gray-50">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Pro plan includes:</h3>
                              <ul className="space-y-2 sm:space-y-3">
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">2,000 verification tokens per month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">200 verifications per day</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Up to 3 images per verification</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">FakeVerifier (Web Search) + Llama 3.3 70B + GPT-OSS-20B</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Faster response time</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Priority support</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Real-time news integration</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Advanced bias detection</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">Email & chat support</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">No rate limits</span>
                                </li>
                              </ul>
                            </Card>
                          </div>
                        </div>
                      )}
                      
                      {/* Pro Plan Info - Show current plan details for Pro users */}
                      {plan === 'pro' && (
                        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">You're on the Pro Plan</h3>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 mb-4">
                            Enjoy all Pro features including 2,000 monthly tokens and 200 daily verifications.
                          </p>
                          <Button 
                            variant="outline" 
                            className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => window.location.href = '/pricing'}
                          >
                            View Plan Details
                          </Button>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <Card className="p-4 sm:p-5 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Notification Preferences</h2>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="email-notifications" className="text-xs sm:text-sm">Email Notifications</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Receive notifications via email</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="email-notifications" checked={settings.notifications.email} onCheckedChange={(c: boolean) => updateSetting('notifications', 'email', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="push-notifications" className="text-xs sm:text-sm">Push Notifications</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Receive notifications in browser</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="push-notifications" checked={settings.notifications.push} onCheckedChange={(c: boolean) => updateSetting('notifications', 'push', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
                            <div className="min-w-0">
                              <Label htmlFor="verification-complete" className="text-xs sm:text-sm">Verification Complete</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Notify when verification is finished</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="verification-complete" checked={settings.notifications.verificationComplete} onCheckedChange={(c: boolean) => updateSetting('notifications', 'verificationComplete', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-yellow-600" />
                            <div className="min-w-0">
                              <Label htmlFor="low-tokens" className="text-xs sm:text-sm">Low Token Alerts</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Notify when running low on tokens</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="low-tokens" checked={settings.notifications.lowTokens} onCheckedChange={(c: boolean) => updateSetting('notifications', 'lowTokens', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="weekly-report" className="text-xs sm:text-sm">Weekly Reports</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Receive weekly usage summaries</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="weekly-report" checked={settings.notifications.weeklyReport} onCheckedChange={(c: boolean) => updateSetting('notifications', 'weeklyReport', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="marketing" className="text-xs sm:text-sm">Marketing Updates</Label>
                              <p className="text-[10px] sm:text-xs text-gray-500">Receive product updates and tips</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="marketing" checked={settings.notifications.marketing} onCheckedChange={(c: boolean) => updateSetting('notifications', 'marketing', c)} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Privacy Tab */}
                  {activeTab === 'privacy' && (
                    <Card className="p-4 sm:p-5 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Privacy & Data</h2>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="share-analytics" className="text-xs sm:text-sm">Share Analytics</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Help improve our service with anonymous usage data</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="share-analytics" checked={settings.privacy.shareAnalytics} onCheckedChange={(c: boolean) => updateSetting('privacy', 'shareAnalytics', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="allow-cookies" className="text-xs sm:text-sm">Allow Cookies</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Enable cookies for better experience</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="allow-cookies" checked={settings.privacy.allowCookies} onCheckedChange={(c: boolean) => updateSetting('privacy', 'allowCookies', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="public-profile" className="text-xs sm:text-sm">Public Profile</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Make your profile visible to other users</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="public-profile" checked={settings.privacy.publicProfile} onCheckedChange={(c: boolean) => updateSetting('privacy', 'publicProfile', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="show-activity" className="text-xs sm:text-sm">Show Activity</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Display your recent activity to others</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="show-activity" checked={settings.privacy.showActivity} onCheckedChange={(c: boolean) => updateSetting('privacy', 'showActivity', c)} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <Card className="p-4 sm:p-5 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Security Settings</h2>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="two-factor" className="text-xs sm:text-sm">Two-Factor Authentication</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="two-factor" checked={settings.security.twoFactor} onCheckedChange={(c: boolean) => updateSetting('security', 'twoFactor', c)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="login-alerts" className="text-xs sm:text-sm">Login Alerts</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Get notified of new login attempts</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Switch id="login-alerts" checked={settings.security.loginAlerts} onCheckedChange={(c: boolean) => updateSetting('security', 'loginAlerts', c)} />
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <Label htmlFor="session-timeout" className="text-xs sm:text-sm">Session Timeout</Label>
                              <p className="text-[10px] sm:text-sm text-gray-500">Automatically sign out after inactivity</p>
                            </div>
                          </div>
                          <select 
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={0}>Never</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Data Tab */}
                  {activeTab === 'data' && (
                    <div className="space-y-4 sm:space-y-6">
                      <Card className="p-4 sm:p-5 md:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Data Management</h2>
                        </div>
                        
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {isExporting ? 'Exporting...' : 'Export Data'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={isClearingHistory} className="text-red-600 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {isClearingHistory ? 'Clearing...' : 'Clear History'}
                            </Button>
                          </div>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-relaxed">
                            Export your data or clear your verification history. Clearing history will permanently delete all records.
                          </p>
                        </div>
                      </Card>

                      {/* Danger Zone */}
                      <Card className="p-4 sm:p-5 md:p-6 bg-red-50 border-red-200">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          <h2 className="text-base sm:text-lg font-semibold text-red-900">Danger Zone</h2>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-red-800 leading-relaxed">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-full max-w-sm sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
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

