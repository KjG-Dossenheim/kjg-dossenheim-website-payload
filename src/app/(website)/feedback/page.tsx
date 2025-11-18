import React from 'react'
import FeedbackForm from './form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback | KjG Dossenheim',
  description: 'Teilen Sie uns Ihre Meinung mit. Wir freuen uns über Ihr Feedback!',
}

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Feedback</h1>
        <p className="text-lg text-muted-foreground">
          Ihre Meinung ist uns wichtig! Teilen Sie uns mit, was gut läuft und was wir verbessern können.
        </p>
      </div>
      <FeedbackForm />
    </div>
  )
}
