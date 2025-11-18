'use client'

// External libraries
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createFeedback } from './actions'
import { formSchema, type FormValues } from './schema'

// Internal components and utilities
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CapWidget } from '@/components/common/cap-widget'
import { Star } from 'lucide-react'

export default function FeedbackForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      rating: 0,
      category: 'general',
      message: '',
      captchaToken: '',
    },
  })

  const [hoveredRating, setHoveredRating] = React.useState(0)

  async function onSubmit(values: FormValues) {
    try {
      const result = await createFeedback(values)

      if (result.success) {
        form.reset()
        toast.success('Vielen Dank für Ihr Feedback!')
      } else {
        toast.error(result.error || 'Fehler beim Übermitteln des Feedbacks.')
      }
    } catch {
      toast.error('Netzwerkfehler.')
    }
  }

  return (
    <section className="mx-auto max-w-lg">
      <Toaster richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Wir freuen uns über Ihr Feedback! Ihre Meinung hilft uns, besser zu werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (optional)</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Ihr Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail (optional)</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="ihre.email@beispiel.de" />
                  </FormControl>
                  <FormDescription>
                    Nur angeben, wenn Sie eine Antwort wünschen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bewertung</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
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
                            className={`h-8 w-8 ${
                              star <= (hoveredRating || field.value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Klicken Sie auf die Sterne, um eine Bewertung abzugeben
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorie (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Kategorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">Allgemein</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="event">Veranstaltung</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ihre Nachricht</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Teilen Sie uns Ihre Gedanken mit..."
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <FormItem>
              {/* register a hidden field to ensure the captcha token is included in the submitted values */}
              <Input type="hidden" {...form.register('captchaToken')} />

              <CapWidget
                endpoint={process.env.NEXT_PUBLIC_CAPTCHA_URL || 'https://captcha.gurl.eu.org/api/'}
                onSolve={(token) => {
                  form.setValue('captchaToken', token, { shouldValidate: true, shouldDirty: true })
                  console.log(`Challenge succeeded, token : ${token}`)
                }}
                onError={() => {
                  form.setValue('captchaToken', '', { shouldValidate: true })
                  console.log(`Challenge failed`)
                }}
                locale={{
                  initial: 'Ich bin (k)ein Roboter',
                  verifying: 'Überprüfung...',
                  solved: 'Verifiziert',
                  error: 'Überprüfung fehlgeschlagen',
                  wasmDisabled: 'WebAssembly ist deaktiviert',
                  verifyingAria: 'Überprüfung, ob Sie ein Mensch sind',
                  solvedAria: 'Überprüfung erfolgreich',
                  errorAria: 'Überprüfung fehlgeschlagen, bitte versuchen Sie es erneut',
                }}
              />
            </FormItem>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.watch('captchaToken')}
            >
              Feedback senden
            </Button>
          </CardFooter>
        </form>
      </Form>
    </section>
  )
}
