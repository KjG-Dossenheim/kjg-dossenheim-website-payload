'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { feedbackFormSchema, type FeedbackFormData } from './schema'
import { submitFeedback } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(
    null,
  )
  const [hoveredRating, setHoveredRating] = useState(0)

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      age: undefined,
      rating: 0,
      comments: '',
    },
  })

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    const result = await submitFeedback(data)
    setSubmitResult(result)
    setIsSubmitting(false)

    if (result.success) {
      form.reset()
    }
  }

  const rating = form.watch('rating')

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Feedback zur Sommerfreizeit</CardTitle>
        <CardDescription>
          Wir freuen uns über dein Feedback! Teile uns mit, wie dir die Sommerfreizeit gefallen
          hat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Age Field */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alter</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Wie alt bist du?"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Star Rating Field */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bewertung</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`size-8 ${
                              star <= (hoveredRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comments Field */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentare (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Was hat dir besonders gut gefallen? Was können wir verbessern?"
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gesendet...' : 'Feedback absenden'}
            </Button>

            {/* Success/Error Message */}
            {submitResult && (
              <Alert variant={submitResult.success ? 'default' : 'destructive'}>
                <AlertDescription>{submitResult.message}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
