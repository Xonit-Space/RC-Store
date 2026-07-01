import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefaultShipping: 'desc' }
  })

  return NextResponse.json({ success: true, data: addresses })
}
