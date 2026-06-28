export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Returns & Refunds</h1>
        </div>

        <div className="space-y-16 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Our Return Policy</h2>
            <p>
              We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns for refund or exchange within 14 days of order delivery. To be eligible for a return, items must be completely unused, unwashed, and in their original packaging with all original tags attached.
            </p>
            <p>
              Please note that certain items, such as customized or personalized RC parts, batteries that have been charged, and sale items, are final sale and cannot be returned unless defective.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Log in to your account and navigate to the <strong>Order History</strong> section.</li>
              <li>Select the order containing the item(s) you wish to return and click <strong>Request Return</strong>.</li>
              <li>Follow the prompts to select the reason for your return and print the provided return shipping label.</li>
              <li>Pack the items securely in their original packaging and attach the return label.</li>
              <li>Drop the package off at any authorized shipping location.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Refunds</h2>
            <p>
              Once your return is received and inspected by our warehouse team, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed and automatically applied to your original method of payment within 5-10 business days.
            </p>
            <p>
              Please note that original shipping costs are non-refundable. If you receive a refund, the cost of return shipping (if applicable) will be deducted from your refund amount.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Exchanges</h2>
            <p>
              If you need to exchange an item for a different size, color, or a different product entirely, the fastest way is to return the original item for a refund and place a new order for the desired item.
            </p>
          </section>

        </div>

      </main>
    </div>
  )
}
