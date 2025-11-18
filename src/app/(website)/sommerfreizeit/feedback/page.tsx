import React from 'react'
import type { Metadata } from 'next'
import { FeedbackForm } from './FeedbackForm'

export const metadata: Metadata = {
  title: `Feedback | Sommerfreizeit | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description:
    'Teile uns dein Feedback zur Sommerfreizeit mit. Wir freuen uns über deine Meinung!',
}

export default function FeedbackPage() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <FeedbackForm />
    </section>
  )
}
