import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CustomerProvider } from "@/components/providers/customer-provider"
import { CustomerSidebar } from "@/components/customer/sidebar"

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/customer")
  }

  const profile = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      addresses: {
        select: {
          id: true, title: true, line1: true, line2: true, city: true, state: true,
          postalCode: true, country: true, phone: true, isDefaultShipping: true, isDefaultBilling: true,
        }
      },
      loyaltyPoint: { select: { pointsBalance: true } },
      storeCredits: { where: { balance: { gt: 0 } }, select: { balance: true }, take: 1 },
      wishlist: {
        select: {
          items: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  slug: true,
                  images: { select: { url: true }, take: 1 }
                }
              }
            }
          }
        }
      }
    },
  })

  return (
    <CustomerProvider profile={profile}>
      <div className="min-h-screen bg-background flex pt-[104px]">
        <CustomerSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </CustomerProvider>
  )
}
