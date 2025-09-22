'use client'

// React and React Hooks
import React, { useEffect, useState } from 'react'

// Third-party libraries
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'

const formSchema = z.object({
  firstNameParent: z.string().min(2, 'Bitte geben Sie Ihren Vornamen ein.'),
  lastNameParent: z.string().min(2, 'Bitte geben Sie Ihren Nachnamen ein.'),
  firstNameChild: z.string().min(2, 'Bitte geben Sie den Vornamen des Kindes ein.'),
  lastNameChild: z.string().min(2, 'Bitte geben Sie den Nachnamen des Kindes ein.'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z
    .string()
    .min(6, 'Bitte geben Sie eine gültige Telefonnummer ein.')
    .max(20, 'Bitte geben Sie eine gültige Telefonnummer ein.'),
  event: z.string().min(1, 'Bitte wählen Sie eine Veranstaltung aus.'),
})

type FormValues = z.infer<typeof formSchema>

export default function KnallbonbonAnmeldungPage() {
  const [eventOptions, setEventOptions] = useState<
    { id: string; title: string; date: Date | null }[]
  >([])
  const [loading, setLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstNameParent: '',
      lastNameParent: '',
      firstNameChild: '',
      lastNameChild: '',
      email: '',
      phone: '',
      event: '',
    },
  })

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const response = await fetch('/api/knallbonbonEvents')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        interface KnallbonbonEvent {
          id: string
          title?: string
          name?: string
          date?: string
        }

        interface KnallbonbonEventResponse {
          docs: KnallbonbonEvent[]
        }

        const formattedOptions = (data as KnallbonbonEventResponse).docs.map(
          (event: KnallbonbonEvent) => ({
            id: event.id,
            title: (event.title || event.name) as string,
            date: event.date ? new Date(event.date) : null,
          }),
        )
        setEventOptions(formattedOptions)
      } catch (error) {
        setEventOptions([{ id: '', title: 'Fehler beim Laden der Events', date: null }])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      const req = await fetch('/api/knallbonbonRegistration', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (req.ok) {
        form.reset()
        toast.success('Anmeldung erfolgreich!')
      } else {
        toast.error('Fehler bei der Anmeldung.')
      }
    } catch {
      toast.error('Netzwerkfehler.')
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <Toaster richColors />
      <CardHeader>
        <CardTitle>Knallbonbon Anmeldung</CardTitle>
        <CardDescription>
          Hier können Sie sich für unser Knallbonbon Event anmelden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4">
            <FormField
              control={form.control}
              name="firstNameParent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Ihr Vorname</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastNameParent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachname</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Ihr Nachname</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstNameChild"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname des Kindes</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Vorname Ihres Kindes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastNameChild"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachname des Kindes</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Nachname Ihres Kindes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>Wir senden Ihnen eine Bestätigung per E-Mail.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notfallnummer</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormDescription>Ihre Telefonnummer für Rückfragen.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veranstaltung</FormLabel>
                  <FormControl>
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <RadioGroup {...field} value={field.value} onValueChange={field.onChange}>
                        {eventOptions.map((opt) => (
                          <label
                            key={opt.id}
                            htmlFor={`event-${opt.id}`}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <RadioGroupItem value={opt.id} id={`event-${opt.id}`} />
                            {opt.title} –{' '}
                            {opt.date
                              ? opt.date.toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Datum unbekannt'}
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormDescription>Wählen Sie eine Veranstaltung aus.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Absenden
            </Button>
          </form>
        </Form>
      </CardContent>
    </section>
  )
}
