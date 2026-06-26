"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ShoppingCart, User, LogOut, Package, Shield, Settings, Terminal, Search, ChevronDown, Moon, Sun, Monitor } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useCartStore } from "@/store/cart"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const cartStore = useCartStore()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  const cartCount = cartStore.getItemCount()

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop All", path: "/products" },
    { name: "Part Finder", path: "/part-finder" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ]

  const accountUrl = session?.user
    ? (session.user.role as string) === "SUPER_ADMIN" || (session.user.role as string) === "ADMIN"
      ? "/admin"
      : (session.user.role as string) === "STAFF"
        ? "/admin/pos"
        : "/customer"
    : "/login"

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date("2026-12-31T23:59:59").getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <header 
      suppressHydrationWarning 
      className={`fixed top-0 z-50 w-full transition-all duration-500 bg-background/70 backdrop-blur-md ${
        scrolled 
          ? "shadow-md border-b border-border/50" 
          : "border-b border-transparent"
      }`}
    >
      {/* Promotion Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center">
        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
          🚨 End of Financial Year Sale - Up to 40% Off - Ends in: 
          <span className="inline-block min-w-[80px] ml-2 tabular-nums">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </p>
      </div>

      <div className={`border-b transition-colors duration-300 ${scrolled ? "border-border" : "border-transparent"}`}>
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo (Left) */}
        <Link href="/" className="flex items-center gap-2 group mr-auto lg:mr-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <img 
            src="/Transparent/logo yellow0.png" 
            alt="Aussie Rigs Arena" 
            className="h-8 w-auto object-contain scale-[3] origin-center lg:origin-left pointer-events-none group-hover:opacity-90 transition-opacity drop-shadow-sm" 
          />
        </Link>

        {/* Main Menu (Center Desktop) */}
        <nav className="hidden lg:flex items-center justify-center flex-1 mx-8 gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path))
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-border"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* User Menu */}
          <div className="relative hidden sm:block">
            {session ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-full transition-colors focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 hover:bg-primary/10 rounded-sm transition-colors"
              >
                <User className="h-4 w-4" /> Login
              </Link>
            )}

            {/* User Dropdown */}
            {isUserMenuOpen && session && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-medium text-foreground truncate">{session.user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  
                  <div className="p-1">
                    <Link href={accountUrl} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors">
                      {accountUrl === "/admin" ? <Shield className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                      {accountUrl === "/admin" ? "Admin Dashboard" : "My Garage"}
                    </Link>
                    {accountUrl === "/customer" && (
                      <Link href="/customer/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors">
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-border p-1">
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-border bg-background ${
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <nav className="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[70vh]">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path))
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            )
          })}

          <div className="my-4 border-t border-border"></div>

          {/* Mobile Auth & Theme */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">Theme Preference</span>
            {mounted && (
              <div className="flex bg-muted rounded-md p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-1.5 rounded-sm transition-colors ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-1.5 rounded-sm transition-colors ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-1.5 rounded-sm transition-colors ${theme === "system" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {session ? (
            <div className="space-y-1">
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-medium text-foreground">{session.user.name || "User Account"}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <Link
                href={accountUrl}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                {accountUrl === "/admin" ? <Shield className="h-5 w-5 text-muted-foreground" /> : <Settings className="h-5 w-5 text-muted-foreground" />}
                {accountUrl === "/admin" ? "Admin Dashboard" : "My Garage"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" /> Log Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-md text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              <User className="h-5 w-5" /> Sign In / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
