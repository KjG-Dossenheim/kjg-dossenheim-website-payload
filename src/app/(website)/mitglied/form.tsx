'use client'

// External libraries
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createMembershipApplication } from './actions'
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
} from '@/components/ui/form'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import { DatePickerInput } from '@/components/ui/date-picker-input'

export default function MitgliedForm() {
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
      const result = await createMembershipApplication(values)

      if (result.success) {
        form.reset()
        toast.success('Mitgliedsantrag erfolgreich übermittelt!')
      } else {
        toast.error(result.error || 'Fehler beim Übermitteln des Antrags.')
      }
    } catch {
      toast.error('Netzwerkfehler.')
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <Toaster richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Mitgliedsantrag</CardTitle>
            <CardDescription>
              Hier können Sie einen Antrag auf Mitgliedschaft stellen.
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
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geburtsdatum</FormLabel>
                  <DatePickerInput
                    id={`birthDate`}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    invalid={!!form.formState.errors.birthDate}
                  />
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
                <FormItem>
                  <div className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Einwilligung zur Datenverarbeitung</FormLabel>
                  </div>
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
              Absenden
            </Button>
          </CardFooter>
        </form>
      </Form>
    </section>
  )
}
