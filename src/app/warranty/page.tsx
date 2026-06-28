export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[800px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Warranty Information</h1>
        </div>

        <div className="space-y-16 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Our Warranty Commitment</h2>
            <p>
              At Aussie Rigs Arena, we stand behind the quality and durability of our RC vehicles and parts. We offer a limited warranty on all our products against defects in materials and workmanship under normal use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">Warranty Coverage Period</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>RC Vehicles (Cars, Trucks, Buggies, Crawlers, Boats, Planes):</strong> 90 Days from the date of purchase.</li>
              <li><strong>Electronics (Motors, ESCs, Servos, Controllers):</strong> 60 Days from the date of purchase.</li>
              <li><strong>Batteries & Chargers:</strong> 30 Days from the date of purchase.</li>
              <li><strong>Spare Parts & Accessories:</strong> 14 Days from the date of purchase.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">What is Not Covered</h2>
            <p>Our warranty does not cover damages resulting from:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>Normal wear and tear (e.g., worn tires, scratched bodies, stripped gears).</li>
              <li>Improper assembly, maintenance, or usage.</li>
              <li>Modifications or alterations made to the product.</li>
              <li>Crash damage, water damage (unless specified as waterproof), or abuse.</li>
              <li>Use of non-approved or aftermarket parts.</li>
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-foreground font-light mb-6">How to Make a Warranty Claim</h2>
            <p>
              If you believe your product is defective and covered under warranty, please contact our support team at <strong>warranty@aussierigsarena.com</strong> with the following information:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>Your order number or proof of purchase.</li>
              <li>A detailed description of the issue.</li>
              <li>Clear photos or videos demonstrating the defect.</li>
            </ul>
            <p>
              Our technicians will review your claim and determine the appropriate resolution, which may include providing replacement parts, authorizing a return for repair, or issuing a replacement product.
            </p>
          </section>

        </div>

      </main>
    </div>
  )
}
