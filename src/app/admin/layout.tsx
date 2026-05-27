import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { Header } from "./layout-header"
import { Sidebar } from "./layout-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 1. Enforce Server-Side secure session RBAC authorization
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin")
  }

  const role = session.user.role as UserRole
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    console.warn(`[Security Alert] Non-administrative account ${session.user.email} attempted admin page access logs.`)
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans">
      <Header user={session.user} />
      <div className="flex-grow flex">
        <Sidebar role={role} />
        <main className="flex-grow p-6 md:p-10 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
