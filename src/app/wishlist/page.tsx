import { redirect } from "next/navigation"

// Wishlist lives under the authenticated customer portal
export default function WishlistRedirect() {
  redirect("/customer/wishlist")
}
