export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Shipping & Delivery</h1>
        </div>

        <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <ul className="list-disc pl-5 space-y-4">
              <li>We ship Australia-wide.</li>
              <li>Shipping costs are calculated at checkout.</li>
              <li>Delivery options include Australia Post, DHL, same day delivery (selected metro areas only), and free in store pickup.</li>
              <li>Same day delivery is available for an additional $60.</li>
              <li>Orders must be placed before 12:00 PM to qualify for same-day delivery.</li>
              <li>Tracking information will be provided once your order has been dispatched.</li>
            </ul>
          </section>
        </div>

      </main>
    </div>
  )
}
