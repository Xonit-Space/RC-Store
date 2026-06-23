import { redirect } from "next/navigation"

// Help content is served via the FAQ page
export default function HelpRedirect() {
  redirect("/faq")
}
