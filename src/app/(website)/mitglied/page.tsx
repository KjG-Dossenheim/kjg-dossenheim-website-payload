'use client'

// External libraries
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Internal components and utilities
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from '@/components/ui/phone-input'
import de from 'react-phone-number-input/locale/de'

// Schema für das Mitgliedsantragsformular
const formSchema = z.object({
  firstName: z.string().min(2, 'Bitte geben Sie Ihren Vornamen ein.'),
  lastName: z.string().min(2, 'Bitte geben Sie Ihren Nachnamen ein.'),
  birthDate: z.string().min(1, 'Bitte geben Sie Ihr Geburtsdatum ein.'),
  address: z.string().min(2, 'Bitte geben Sie Ihre Adresse ein.'),
  city: z.string().min(1, 'Bitte geben Sie Ihre Stadt ein.'), // hinzugefügt
  postalCode: z.string().min(1, 'Bitte geben Sie Ihre Postleitzahl ein.'), // hinzugefügt
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z.string().optional(),
  status: z.enum(['new', 'in_review', 'completed', 'rejected']),
  notes: z.string().optional(),
  consentToDataProcessing: z.boolean().refine((val) => val, {
    message: 'Bitte stimmen Sie der Datenverarbeitung zu.',
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function MitgliedPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      address: '',
      city: '',
      postalCode: '',
      email: '',
      phone: '',
      status: 'new',
      notes: '',
      consentToDataProcessing: false,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const req = await fetch('/api/membershipApplication', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (req.ok) {
        form.reset()
        toast.success('Mitgliedsantrag erfolgreich übermittelt!')
      } else {
        toast.error('Fehler beim Übermitteln des Antrags.')
      }
    } catch {
      toast.error('Netzwerkfehler.')
    }
  }

  return (
    <section className="mx-auto max-w-lg">
      <Toaster richColors />
      <CardHeader>
        <CardTitle>Mitgliedsantrag</CardTitle>
        <CardDescription>Hier können Sie einen Antrag auf Mitgliedschaft stellen.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4">
            <span className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Vorname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nachname</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Nachname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </span>

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geburtsdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Adresse" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Postleitzahl</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Postleitzahl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Stadt</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Stadt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </span>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="E-Mail" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonnummer</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      placeholder="Telefonnummer"
                      defaultCountry="DE"
                      labels={de}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notizen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consentToDataProcessing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="mb-2">Einwilligung zur Datenverarbeitung</FormLabel>
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
