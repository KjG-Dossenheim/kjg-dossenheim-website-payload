import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepperStep = {
  label: string
}

type StepperProps = {
  steps: StepperStep[]
  currentStep: number // 1-based
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Fortschritt" className={cn('flex items-center gap-0', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted-foreground/40 bg-background text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="size-4" strokeWidth={2.5} /> : stepNumber}
              </div>
              <span
                className={cn(
                  'hidden text-center text-xs leading-tight sm:block',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-0.5 flex-1 transition-colors',
                  stepNumber < currentStep ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
