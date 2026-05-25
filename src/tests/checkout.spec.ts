import { test, expect } from "@playwright/test"

test.describe("Storefront Checkout Funnel E2E Spec", () => {
  
  test("should successfully navigate the full purchase funnel", async ({ page }) => {
    // 1. Land on Storefront Homepage
    await page.goto("/")
    await expect(page).toHaveTitle(/NEOSHOP ULTRA/)

    // 2. Locate omnibox and search for designer cargo jacket
    const searchInput = page.locator("input[placeholder*='Search products']")
    await searchInput.fill("Cargo Bomber")
    await searchInput.press("Enter")

    // 3. Confirm catalog navigation matching search results
    await expect(page.url()).toContain("search=Cargo+Bomber")
    const productCard = page.locator("text=Oversized Utility Cargo Bomber").first()
    await expect(productCard).toBeVisible()
    await productCard.click()

    // 4. Detailed selector matching colors and sizes (e.g. Size M, Obsidian Black)
    await expect(page.url()).toContain("product/oversized-utility-cargo-bomber")
    
    // Choose size M
    const sizeButton = page.locator("button:has-text('M')")
    await sizeButton.click()

    // Add product variant to shopping basket
    const addToCartButton = page.locator("button:has-text('Add to Cart')")
    await addToCartButton.click()

    // 5. Open Cart drawer overlays
    const cartButton = page.locator("button:has-text('3')") // Mapped from default cart counts
    await cartButton.click()

    // Verify product exists in active basket lines
    await expect(page.locator("text=Obsidian")).toBeVisible()

    // 6. Click checkout to transition securely to Stripe Billing
    const checkoutButton = page.locator("button:has-text('Proceed to Checkout')")
    await checkoutButton.click()

    // Ensure Stripe billing gateway URL has loaded
    await page.waitForURL(/checkout.stripe.com/)
    await expect(page.url()).toContain("stripe.com")
  })
})
