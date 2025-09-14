"use client"
import React from "react"
import Link from "next/link"
import { Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import UserProfile from "./user-profile"

const menuItems = [
  { name: "Features", href: "/features" },
  { name: "Live News", href: "/live-news" },
  { name: "About Us", href: "/about" },
  { name: "Verify News", href: "/verify" },
  { name: "Quick Verify", href: "/ai-analysis" },
]

export function Header() {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { user, loading } = useAuth()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2 group">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-4 transition-all duration-300 lg:px-8 xl:px-12",
            isScrolled && "bg-white/80 dark:bg-slate-900/80 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-6",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-4 py-1 lg:gap-0 lg:py-2">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center">
                <img 
                  src="/Images/Logo de FakeVerifier.png" 
                  alt="FakeVerifier Logo" 
                  className="h-16 w-auto object-contain sm:h-20"
                />
              </Link>

              {/* Mobile: User Profile and Burger Menu */}
              <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                {!loading && (
                  <>
                    {user ? (
                      <UserProfile />
                    ) : (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 px-2 sm:px-3"
                        >
                          <Link href="/Login">
                            <span className="text-xs sm:text-sm">Sign In</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3"
                        >
                          <Link href="/Signup">
                            <span className="text-xs sm:text-sm">Sign Up</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2 cursor-pointer p-2"
                >
                  <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-5 sm:size-6 duration-200" />
                  <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 sm:size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-6 lg:gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Menu */}
            <div className="bg-white dark:bg-slate-900 group-data-[state=active]:block lg:group-data-[state=active]:flex mb-4 hidden w-full flex-wrap items-center justify-end space-y-6 rounded-2xl border p-4 shadow-2xl shadow-zinc-300/20 md:flex-nowrap md:space-y-4 lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden w-full">
                <ul className="space-y-4 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuState(false)}
                        className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 block duration-150 py-2"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Desktop: User Profile and Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <UserProfile />
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link href="/verify">
                          <span>Verify News</span>
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                      >
                        <Link href="/Login">
                          <span>Sign In</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link href="/Signup">
                          <span>Sign Up</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
