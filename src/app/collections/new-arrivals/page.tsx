import { redirect } from "next/navigation"

// New arrivals are served via the main products catalog with isNewRelease filter
export default function NewArrivalsRedirect() {
  redirect("/products?filter=new")
}
