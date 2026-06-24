"use client"

import { Home, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface HeaderProps {
  user: any
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/40 bg-background flex items-center px-6 md:px-10 shrink-0 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Home strokeWidth={1} className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
          <h1 className="text-[11px] font-medium tracking-[0.2em] uppercase text-foreground">
            Aussie Rigs Arena <span className="opacity-50">Atelier</span>
          </h1>
        </Link>
        <span className="text-[9px] tracking-[0.25em] uppercase text-terracotta border border-terracotta/30 px-2 py-0.5">
          Admin
        </span>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] tracking-widest uppercase text-foreground">{user.name || "Administrator"}</p>
          <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">{user.role}</span>
        </div>
        <div className="h-9 w-9 bg-muted border border-border/60 flex items-center justify-center text-[11px] uppercase text-foreground tracking-widest">
          {user.name?.[0] || "A"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign Out"
          className="h-9 w-9 flex items-center justify-center border border-border/40 hover:border-destructive/50 hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors group"
        >
          <LogOut strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
