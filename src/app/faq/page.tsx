import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      category: "Orders & Shipping",
      items: [
        { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International delivery varies between 7-14 days depending on the destination." },
        { q: "Do you ship internationally?", a: "Yes, we ship to over 150 countries worldwide. Shipping costs and delivery times are calculated at checkout based on your location." },
        { q: "Can I modify my order after placing it?", a: "Orders can only be modified within 1 hour of placement. Please contact our support team immediately if you need to make changes." }
      ]
    },
    {
      category: "Returns & Exchanges",
      items: [
        { q: "What is your return policy?", a: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached." },
        { q: "How do I process an exchange?", a: "To exchange an item, please process a return for the original item and place a new order for the desired size or color." },
        { q: "Are returns free?", a: "Domestic returns are complimentary. International return shipping costs are the responsibility of the customer." }
      ]
    },
    {
      category: "Product & Care",
      items: [
        { q: "Where are your products manufactured?", a: "Our garments are ethically manufactured in specialized ateliers across Italy, Portugal, and Japan, depending on the material and required expertise." },
        { q: "How should I care for my garments?", a: "Each product includes specific care instructions on the inner label. We generally recommend dry cleaning for structured pieces and cold hand-washing for delicate fabrics." }
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
