import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      items: [
        { q: "What scale RC vehicles do you sell?", a: "We currently specialise in 1:10 scale RC vehicles." },
        { q: "Are your RC vehicles suitable for beginners?", a: "Yes. We stock vehicles for beginners through to experienced hobbyists." },
        { q: "Can I see or try the vehicles before purchasing?", a: "Yes. Visit our store to view selected models and experience many of them on our indoor RC tracks before buying." },
        { q: "Can I customise my RC vehicle?", a: "Yes. Customisation and upgrades are available on many models. Please allow up to 2 business days." },
        { q: "Where can I see available upgrades?", a: "Compatible upgrades are listed on each product page." },
        { q: "What if my vehicle has a fault when I receive it?", a: "Please contact us as soon as possible if you believe your vehicle has a manufacturing fault." },
        { q: "Do you offer after-sales support?", a: "Yes. Bring your vehicle to us for troubleshooting and setup assistance free of charge." },
        { q: "Can you repair my RC vehicle?", a: "Yes. We'll diagnose the issue. If replacement parts are required due to accidental damage or wear and tear, parts and installation will be quoted before repairs." },
        { q: "Do you sell spare parts?", a: "Yes. We stock a range of genuine spare parts and accessories." },
        { q: "Does my vehicle include a battery and charger?", a: "Please refer to the product page, as inclusions vary by model." },
        { q: "Are the vehicles waterproof?", a: "Some models are water-resistant. Please check the product specifications." },
        { q: "Which payment methods do you accept?", a: "We accept the payment methods shown at checkout." }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Support</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-16">
          {faqs.map((group, i) => (
            <div key={i} className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-4">
                {group.category}
              </h2>
              <Accordion type="multiple" className="w-full">
                {group.items.map((item, j) => (
                  <AccordionItem key={j} value={`item-${i}-${j}`} className="border-border/40">
                    <AccordionTrigger className="font-serif text-lg font-light hover:no-underline hover:text-accent transition-colors text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center border-t border-border/40 pt-16">
          <p className="text-sm text-muted-foreground mb-4">Still need help?</p>
          <a href="/contact" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] border-b border-foreground text-foreground hover:text-accent hover:border-accent transition-colors pb-1">
            Contact Support
          </a>
        </div>

      </main>
    </div>
  )
}
