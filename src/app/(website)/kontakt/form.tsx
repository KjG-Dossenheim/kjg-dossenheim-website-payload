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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { PhoneInput } from '@/components/ui/phone-input'
import de from 'react-phone-number-input/locale/de'

import { CapWidget } from '@/components/common/cap-widget'
import { sendMail } from './sendMail'

import { formSchema, type FormValues } from './schema'

export default function ContactForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      captchaToken: '',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const result = await sendMail(values)
      if (result.success) {
        toast.success('Nachricht erfolgreich gesendet.')
        form.reset()
      } else {
        if (result.error === 'invalid-captcha') {
          toast.error('Bitte bestätigen Sie die Captcha-Prüfung erneut.')
          form.setValue('captchaToken', '', { shouldValidate: true })
          return
        }
        toast.error('Fehler beim Senden der Nachricht.')
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
            <CardTitle>Kontakt</CardTitle>
            <CardDescription>
              Hier können Sie uns eine Nachricht senden. Wir melden uns so schnell wie möglich bei
              Ihnen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachricht</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Nachricht" />
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
                endpoint="https://captcha.gurl.eu.org/api/"
                style={
                  {
                    '--cap-background': 'hsl(var(--background))',
                    '--cap-border-color': 'hsl(var(--border))',
                    '--cap-border-radius': 'var(--radius)',
                    '--cap-color': 'hsl(var(--foreground))',
                    '--cap-checkbox-border': '1px solid hsl(var(--ring))',
                    '--cap-checkbox-background': 'hsl(var(--primary-foreground))',
                    '--cap-spinner-color': 'hsl(var(--primary))',
                    '--cap-spinner-background-color': 'hsl(var(--primary-foreground))',
                    '--cap-widget-width': '250px',
                  } as React.CSSProperties
                }
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
              Absenden
            </Button>
          </CardFooter>
        </form>
      </Form>
    </section>
  )
}
