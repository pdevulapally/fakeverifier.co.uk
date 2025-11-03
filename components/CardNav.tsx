'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ChevronDown, Crown, Settings } from 'lucide-react';

type NavLink = { label: string; ariaLabel?: string; href?: string };
type Item = { label: string; bgColor: string; textColor: string; links: NavLink[] };

export default function CardNav({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
}: {
  logo: string;
  logoAlt?: string;
  items: Item[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const calculateHeight = () => {
    const navEl = navRef.current as any;
    if (!navEl) return 260;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement | null;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;
        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        contentEl.offsetHeight;
        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;
        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;
        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current as any;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { tlRef.current = newTl; }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => { if (el) cardsRef.current[i] = el; };

  const handleGetStarted = () => {
    router.push('/login');
  };

  // Load user plan when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserPlan();
    }
  }, [user]);

  async function loadUserPlan() {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user-plan?uid=${user.uid}`);
      const data = await response.json();
      if (response.ok) {
        setUserPlan(data.plan || 'free');
      }
    } catch (error) {
      console.error('Error loading user plan:', error);
      setUserPlan('free');
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userDropdownOpen && !target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef as any} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`} onClick={toggleMenu} role="button" aria-label={isExpanded ? 'Close menu' : 'Open menu'} tabIndex={0} style={{ color: menuColor || '#000' }}>
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>
          <div className="logo-container">
            <img src={logo} alt={logoAlt} className="logo" />
          </div>
           {user ? (
             <div className="relative user-dropdown">
               <button 
                 ref={buttonRef}
                 onClick={() => {
                   console.log('User profile clicked, current state:', userDropdownOpen);
                   if (buttonRef.current) {
                     const rect = buttonRef.current.getBoundingClientRect();
                     setButtonPosition({
                       top: rect.bottom + window.scrollY + 8,
                       right: window.innerWidth - rect.right - window.scrollX
                     });
                   }
                   setUserDropdownOpen(!userDropdownOpen);
                 }}
                 className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                 style={{ backgroundColor: 'transparent', color: buttonTextColor }}
               >
                 <div className="grid h-8 w-8 place-items-center rounded-full text-xs">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                   ) : (
                     <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                   )}
                 </div>
                 <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
               {/* Dropdown Menu */}
               {userDropdownOpen && createPortal(
                <div 
                  className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ 
                    position: 'fixed',
                    top: `${buttonPosition.top}px`,
                    right: `${buttonPosition.right}px`,
                    width: '256px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 9999
                  }}
                >
                  <div className="p-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-sm">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-blue-600 font-medium">{userPlan} Plan</p>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button 
                        onClick={() => window.location.href = '/pricing'}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </button>
                      <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
               )}
            </div>
          ) : (
            <button 
              type="button" 
              className="card-nav-cta-button" 
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          )}
        </div>
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0,3).map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="nav-card" ref={setCardRef(idx)} style={{ backgroundColor: item.bgColor, color: item.textColor }}>
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {(item.links || []).map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} className="nav-card-link" href={lnk.href || '#'} aria-label={lnk.ariaLabel}>
                    <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}


