export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Warranty Information</h1>
        </div>

        <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <p>
              We do not provide a separate store warranty.
            </p>
            <p>
              If you receive a product with a manufacturing fault, please contact us immediately.
            </p>
            <p>
              We proudly provide free after sales support, including troubleshooting, setup assistance and general advice. Customers are welcome to bring their RC vehicle to our store for assistance.
            </p>
            <p>
              Where repairs require replacement parts due to accidental damage, impact, misuse or normal wear and tear, replacement parts and installation costs will be quoted before any work is carried out.
            </p>
          </section>
        </div>

      </main>
    </div>
  )
}
