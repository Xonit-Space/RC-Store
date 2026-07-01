export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Privacy Policy</h1>
        </div>

        <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <p>
              We respect your privacy. Personal information collected through our website is used only to process orders, provide customer support and improve our services.
            </p>
            <p>
              We do not sell your personal information to third parties. Payment information is processed securely by our payment providers.
            </p>
          </section>
        </div>

      </main>
    </div>
  )
}
