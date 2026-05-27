import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Shipping & Returns</h1>
        </div>

        <div className="space-y-16 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Dispatch Timeline</h2>
            <p>
              All orders are processed and dispatched from our primary fulfillment center within 24-48 hours of order placement, excluding weekends and public holidays. During seasonal launches or high-volume periods, dispatch may take up to 72 hours.
            </p>
            <p>
              Once your order has been handed over to the courier, you will receive a dispatch confirmation email containing a tracking number.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Domestic Delivery (Sri Lanka)</h2>
            <div className="border border-border/40 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-foreground font-bold text-xs uppercase tracking-wider">Standard Delivery</h3>
                  <p className="text-xs mt-1">2-4 Business Days</p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-bold">LKR 450</p>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Free over LKR 15,000</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div>
                  <h3 className="text-foreground font-bold text-xs uppercase tracking-wider">Express Delivery (Colombo)</h3>
                  <p className="text-xs mt-1">Next Business Day</p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-bold">LKR 800</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">International Shipping</h2>
            <p>
              We partner with DHL Express for all international shipments to ensure secure and timely delivery. Shipping rates and estimated delivery times are calculated dynamically at checkout based on your delivery zone.
            </p>
            <p>
              <strong>Important Note on Duties & Taxes:</strong> International orders may be subject to customs duties and import taxes upon arrival in the destination country. These charges are determined by the local customs authority and are the sole responsibility of the recipient. NeoShop Ultra cannot predict or control these charges.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Returns Policy</h2>
            <p>
              We accept returns for refund or exchange within 14 days of order delivery. To be eligible for a return, the garment must be completely unworn, unwashed, and in pristine condition with all original tags and security ribbons attached.
            </p>
            <p>
              Footwear must be returned in its original shoebox, placed inside a protective shipping box. The shoebox itself cannot be used as the shipping container.
            </p>
            <p>
              To initiate a return, please access your account dashboard or contact our client services team with your order number.
            </p>
          </section>
        </div>

      </main>
      <Footer />
    </div>
  )
}
