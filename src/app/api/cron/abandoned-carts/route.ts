import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAbandonedCartRecovery } from "@/services/email";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  // Optional: secure this endpoint using a cron secret header
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Find users who have items in their cart, haven't checked out,
    // and whose cart hasn't been modified in the last 24 hours.
    // We also need to track if we already sent them an email, but for MVP we will look for carts updated between 24 and 48 hours ago.
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const abandonedCarts = await db.cart.findMany({
      where: {
        updatedAt: {
          lte: oneDayAgo,
          gt: twoDaysAgo,
        },
        items: {
          some: {} // Has at least one item
        }
      },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: { product: { include: { images: { take: 1 } } } }
            },
            addon: true
          }
        }
      }
    });

    let sentCount = 0;

    for (const cart of abandonedCarts) {
      if (!cart.user?.email) continue;

      const items = cart.items.map(item => {
        if (item.addon) {
          return {
            id: item.addon.id,
            name: item.addon.name,
            price: Number(item.addon.price),
            image: item.addon.image,
          };
        }
        return {
          id: item.variant!.id,
          name: item.variant!.product.name,
          price: Number(item.variant!.price || item.variant!.product.price),
          image: item.variant!.product.images?.[0]?.url || undefined,
        };
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      
      await sendAbandonedCartRecovery({
        email: cart.user.email,
        customerName: cart.user.name || "Customer",
        items,
        checkoutUrl: `${baseUrl}/checkout`,
      });

      sentCount++;
    }

    logger.info({ message: `Abandoned cart cron executed`, context: { sentCount } });

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    logger.error({ message: "Failed to process abandoned carts", error });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
