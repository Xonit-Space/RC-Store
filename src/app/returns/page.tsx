export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Returns & Refunds</h1>
        </div>

        <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <p>
              We offer change of mind returns within 14 days of receiving your order, provided:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The item is unused.</li>
              <li>It is returned in its original condition and packaging.</li>
              <li>All included accessories are returned.</li>
            </ul>
            <p className="pt-2">
              Please contact us before returning your order.
            </p>
            <p className="pt-4">
              If you believe your product has a manufacturing fault on arrival, please contact us as soon as possible so we can assist.
            </p>
          </section>
        </div>

      </main>
    </div>
  )
}
