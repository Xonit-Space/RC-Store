export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Terms of Service</h1>
        </div>

        <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-4">Pricing</h2>
            <p>
              All prices are in Australian Dollars (AUD) and include GST unless otherwise stated. Shipping charges are calculated at checkout.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-4">Terms of Service</h2>
            <p>
              By placing an order, you agree to our pricing, shipping, returns and support policies. Product images may vary slightly from the actual product. Availability is subject to stock on hand. We reserve the right to update product information, pricing and these terms without prior notice.
            </p>
          </section>

        </div>

      </main>
    </div>
  )
}
