import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const role = (session.user as any).role
  const callbackUrl = searchParams.callbackUrl
  
  if (callbackUrl && callbackUrl !== "/" && !callbackUrl.includes("/login")) {
    redirect(callbackUrl)
  }
  
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin")
  } else if (role === "STAFF") {
    redirect("/admin/pos")
  } else {
    redirect("/customer")
  }
}
