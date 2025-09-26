import React from 'react'

interface AgeRangeSectionProps {
  alter: string
}

export default function AgeRangeSection({ alter }: AgeRangeSectionProps) {
  return (
    <section>
      <div className="bg-primary p-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Für{' '}
          <span className="decoration-accent-warning underline decoration-4 md:decoration-8">
            alle
          </span>{' '}
          Kinder zwischen {alter}
        </h2>
      </div>
    </section>
  )
}
