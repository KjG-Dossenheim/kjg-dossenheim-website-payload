'use client'

// React and React Hooks
import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react'

// Next.js
import { useSearchParams } from 'next/navigation'

// Third-party libraries
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { parse, format } from 'date-fns'

// UI Components
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  FieldLabel,
  FieldDescription,
  Field,
  FieldError,
  FieldSeparator,
  FieldSet,
  FieldGroup,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Send, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

import { CapWidget } from '@/components/common/cap-widget'
import { formSchema, type FormValues, GENDER_OPTIONS, PICKUP_OPTIONS } from './schema'
import { useKnallbonbonEvents } from './useKnallbonbonEvents'

import { PhoneInput } from '@/components/ui/phone-input'
import { DatePickerInput } from '@/components/ui/date-picker-input'

// Debounce utility hook for validation
function useDebounceValidation(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)
  }, [callback, delay])
}

type ChildFieldsetProps = {
  control: Control<FormValues>
  index: number
  onRemove: (index: number) => void
  canRemove: boolean
}

const ChildFieldset = memo(function ChildFieldset({
  control,
  index,
  onRemove,
  canRemove,
}: ChildFieldsetProps) {
  return (
    <div className="border-border space-y-4 rounded-md border p-4">
      <div className="flex items-start justify-between gap-4">
        <FieldLegend variant="legend">{index + 1}. Kind</FieldLegend>
        {canRemove && (
          <Button type="button" variant="outline" size="icon" onClick={() => onRemove(index)}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      <FieldGroup className="flex flex-col gap-4 md:flex-row md:space-y-0">
        <Controller
          control={control}
          name={`child.${index}.firstName`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`first-name-child-${index}`}>Vorname</FieldLabel>
              <Input
                id={`first-name-child-${index}`}
                type="text"
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`child.${index}.lastName`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`last-name-child-${index}`}>Nachname</FieldLabel>
              <Input
                id={`last-name-child-${index}`}
                type="text"
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Controller
        control={control}
        name={`child.${index}.dateOfBirth`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`date-of-birth-child-${index}`}>Geburtsdatum</FieldLabel>
            <DatePickerInput
              id={`date-of-birth-child-${index}`}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`child.${index}.gender`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Geschlecht</FieldLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                field.onBlur()
              }}
            >
              <SelectTrigger
                id={`gender-child-${index}`}
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`child.${index}.healthInfo`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`health-info-${index}`}>Gesundheitsinformationen</FieldLabel>
            <Textarea
              id={`health-info-${index}`}
              {...field}
              aria-invalid={fieldState.invalid}
              placeholder="z.B. Allergien, Medikamente, Besonderheiten"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`child.${index}.pickupInfo`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Abholinformation</FieldLabel>
            <RadioGroup
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                field.onBlur()
              }}
              aria-invalid={fieldState.invalid}
            >
              {PICKUP_OPTIONS.map((option) => (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <RadioGroupItem value={option.value} id={`pickup-${option.value}-${index}`} />
                  <FieldLabel htmlFor={`pickup-${option.value}-${index}`} className="font-normal">
                    {option.label}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`child.${index}.photoConsent`}
        render={({ field }) => (
          <FieldSet>
            <FieldLegend variant="label">Bilder</FieldLegend>
            <Field orientation="horizontal">
              <Checkbox
                id={`photo-consent-${index}`}
                name={field.name}
                checked={!!field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true)
                  field.onBlur()
                }}
              />
              <FieldLabel htmlFor={`photo-consent-${index}`} className="font-normal">
                Ich bin damit einverstanden, dass Fotos meines Kindes veröffentlicht werden
              </FieldLabel>
            </Field>
          </FieldSet>
        )}
      />
    </div>
  )
})

ChildFieldset.displayName = 'ChildFieldset'

const MAX_CHILDREN = 5

const INITIAL_CHILD_VALUES = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  photoConsent: false,
  gender: 'noInfo' as const,
  healthInfo: '',
  pickupInfo: 'pickedUp' as const,
}

/**
 * Renders the Knallbonbon event registration form.
 *
 * This component provides:
 * - Event selection loaded via `useKnallbonbonEvents`, indicating availability and free spots.
 * - Contact information fields with validation (first name, last name, address, phone, email).
 * - Debounced field validation for email and phone to reduce validation noise.
 * - A dynamic list of child entries managed via `useFieldArray`, with add/remove controls and a configurable maximum.
 * - A CAPTCHA widget that must be solved before submission is enabled.
 * - Toast notifications for success and error states.
 *
 * Behavior:
 * - Prefills the selected event from the `event` URL search parameter, if present.
 * - Validates fields using `zodResolver` with `react-hook-form`, validating on blur and re-validating on blur.
 * - Transforms each child's `dateOfBirth` from German format (`d.MM.yyyy`) to ISO (`yyyy-MM-dd`) before submission.
 * - Submits the form as JSON to `/knallbonbon/anmeldung/send-form` and handles server responses,
 *   including special handling for an `invalid-captcha` error.
 * - Disables submission while submitting or when the CAPTCHA token is missing.
 *
 * Accessibility:
 * - Applies `aria-invalid` for invalid fields and shows inline error messages.
 * - Displays skeleton placeholders while event options are loading.
 *
 * @returns JSX element rendering the full registration form UI.
 */
export function KnallbonbonAnmeldungForm() {
  const { eventOptions, loading } = useKnallbonbonEvents()
  const searchParams = useSearchParams()
  const eventFromUrl = searchParams.get('event')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      captchaToken: '',
      event: eventFromUrl || '',
      child: [INITIAL_CHILD_VALUES],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'child',
  })

  // Debounced validation for email field
  const validateEmail = useCallback(() => {
    form.trigger('email')
  }, [form])
  const debouncedEmailValidation = useDebounceValidation(validateEmail, 500)

  // Debounced validation for phone field
  const validatePhone = useCallback(() => {
    form.trigger('phone')
  }, [form])
  const debouncedPhoneValidation = useDebounceValidation(validatePhone, 500)

  const handleRemoveChild = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove],
  )

  const eventRadioOptions = useMemo(
    () =>
      eventOptions.map((eventOption) => (
        <Field
          orientation="horizontal"
          key={eventOption.id}
          className="flex cursor-pointer items-center gap-2"
        >
          <RadioGroupItem
            value={eventOption.isFull ? '' : eventOption.id}
            id={`event-${eventOption.id}`}
            disabled={!eventOption.id || eventOption.isFull}
          />
          <div className="flex flex-col">
            <FieldLabel htmlFor={`event-${eventOption.id}`} className="font-normal">
              {eventOption.title} – {eventOption.dateLabel}{' '}
            </FieldLabel>
            {eventOption.isFull ? (
              <FieldDescription>Ausgebucht</FieldDescription>
            ) : eventOption.maxParticipants !== undefined && eventOption.maxParticipants > 0 ? (
              <FieldDescription>{eventOption.freeSpots} Plätze frei</FieldDescription>
            ) : null}
          </div>
        </Field>
      )),
    [eventOptions],
  )

  const handleCaptchaSolve = useCallback(
    (token: string | null | undefined) => {
      form.setValue('captchaToken', token ?? '', {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [form],
  )

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        // Transform German date format (d.MM.yyyy) to ISO format (yyyy-MM-dd)
        const transformedValues = {
          ...values,
          child: values.child.map((child) => {
            let isoDateOfBirth = child.dateOfBirth
            if (child.dateOfBirth && child.dateOfBirth.includes('.')) {
              try {
                const parsedDate = parse(child.dateOfBirth, 'd.MM.yyyy', new Date())
                isoDateOfBirth = format(parsedDate, 'yyyy-MM-dd')
              } catch (error) {
                console.error('Error parsing date:', error)
              }
            }
            return {
              ...child,
              dateOfBirth: isoDateOfBirth,
            }
          }),
        }

        const response = await fetch('/knallbonbon/anmeldung/send-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedValues),
        })
        const result = await response.json().catch(() => ({}))

        if (response.ok) {
          form.reset()
          toast.success('Anmeldung erfolgreich!')
        } else {
          if (result?.error === 'invalid-captcha') {
            toast.error('Bitte bestätigen Sie die Captcha-Prüfung erneut.')
            form.setValue('captchaToken', '', { shouldValidate: true })
            return
          }
          const message = typeof result?.message === 'string' ? result.message : undefined
          toast.error(message ?? 'Fehler bei der Anmeldung.')
        }
      } catch (error) {
        console.error('Form submission error:', error)
        toast.error('Netzwerkfehler. Bitte versuchen Sie es später erneut.')
      }
    },
    [form],
  )

  return (
    <>
      <Toaster richColors />
      <CardHeader>
        <CardTitle>Knallbonbon Anmeldung</CardTitle>
        <CardDescription>
          Hier können Sie sich für unser Knallbonbon Event anmelden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="knallbonbon-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <Controller
                control={form.control}
                name="event"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Veranstaltung</FieldLabel>
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          field.onBlur()
                        }}
                        aria-invalid={fieldState.invalid}
                      >
                        {eventRadioOptions}
                      </RadioGroup>
                    )}
                    <FieldDescription>Wählen Sie eine Veranstaltung aus.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Kontakt</FieldLegend>
              <FieldGroup className="flex flex-col gap-4 md:flex-row md:space-y-0">
                <Controller
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="first-name-parent">Vorname</FieldLabel>
                      <Input
                        id="first-name-parent"
                        type="text"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="given-name"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="last-name">Nachname</FieldLabel>
                      <Input
                        id="last-name"
                        type="text"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="family-name"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Controller
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address">Adresse</FieldLabel>
                    <Input
                      id="address"
                      type="text"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="street-address"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="postal-code">Postleitzahl</FieldLabel>
                    <Input
                      id="postal-code"
                      type="text"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="postal-code"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="city">Stadt</FieldLabel>
                    <Input
                      id="city"
                      type="text"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="address-level2"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Notfallnummer</FieldLabel>
                    <PhoneInput
                      {...field}
                      placeholder="Telefonnummer"
                      onChange={(value) => {
                        field.onChange(value)
                        debouncedPhoneValidation()
                      }}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">E-Mail</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        debouncedEmailValidation()
                      }}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                    />
                    <FieldDescription>
                      Wir senden Ihnen eine Bestätigung per E-Mail.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldSet>
            <FieldSeparator />
            <FieldSet className="gap-6">
              <FieldLegend variant="label">Kinder</FieldLegend>
              <FieldDescription>
                Fügen Sie Kinder hinzu, für die Sie Angaben machen möchten.
              </FieldDescription>
              <FieldGroup className="flex flex-col gap-6">
                {fields.map((child, index) => (
                  <ChildFieldset
                    key={child.id}
                    control={form.control}
                    index={index}
                    onRemove={handleRemoveChild}
                    canRemove={fields.length > 1}
                  />
                ))}
              </FieldGroup>
              <Button
                type="button"
                variant="outline"
                onClick={() => append(INITIAL_CHILD_VALUES)}
                disabled={fields.length >= MAX_CHILDREN}
              >
                <Plus />
                Weiteres Kind hinzufügen
              </Button>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <Field data-invalid={Boolean(form.formState.errors.captchaToken)}>
                <FieldLabel>Spam-Schutz</FieldLabel>
                <input type="hidden" {...form.register('captchaToken')} />
                <CapWidget
                  endpoint="https://captcha.gurl.eu.org/api/"
                  onSolve={handleCaptchaSolve}
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
                />
                <FieldDescription>
                  Bitte lösen Sie das CAPTCHA, um die Anmeldung abzuschließen.
                </FieldDescription>
                {form.formState.errors.captchaToken && (
                  <FieldError errors={[form.formState.errors.captchaToken]} />
                )}
              </Field>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="grow"
          type="submit"
          disabled={form.formState.isSubmitting || !form.watch('captchaToken')}
          form="knallbonbon-form"
        >
          <Send /> Absenden
        </Button>
      </CardFooter>
      <CardFooter>
        <CardDescription>
          Nach dem Absenden der Anmeldung erhalten Sie eine Bestätigungs-E-Mail. Bitte prüfen Sie
          auch Ihren Spam-Ordner.
        </CardDescription>
      </CardFooter>
    </>
  )
}
