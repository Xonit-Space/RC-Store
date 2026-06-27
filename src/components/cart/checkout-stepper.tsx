"use client"

import { ShoppingCart, Truck, CreditCard, Check } from "lucide-react"
import Link from "next/link"

interface CheckoutStepperProps {
  currentStep: number
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const steps = [
    { id: 1, title: "Shopping Bag", icon: ShoppingCart, href: "/cart" },
    { id: 2, title: "Shipping Details", icon: Truck, href: "/checkout" },
    { id: 3, title: "Secure Payment", icon: CreditCard, href: null },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        
        {/* Background connector line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted/40 z-0"></div>

        {/* Active connector line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          // Disable clicking ahead of the current progress
          const canClick = step.href && (isCompleted || isActive || step.id < currentStep);

          const StepContent = (
            <div className={`relative z-10 flex flex-col items-center gap-2 ${canClick ? 'cursor-pointer group' : 'cursor-default'}`}>
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-300 ${
                  isActive 
                    ? "border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                    : isCompleted 
                      ? "border-primary bg-primary text-black group-hover:bg-primary/80" 
                      : "border-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 font-bold" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <span 
                className={`text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 w-32 text-center transition-colors ${
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                } ${canClick ? 'group-hover:text-primary' : ''}`}
              >
                {step.title}
              </span>
            </div>
          )

          return (
            <div key={step.id}>
              {canClick ? (
                <Link href={step.href!}>
                  {StepContent}
                </Link>
              ) : (
                StepContent
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

