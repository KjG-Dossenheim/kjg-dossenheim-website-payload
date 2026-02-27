'use client'

// React and React Hooks
import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Next.js
import { useSearchParams } from 'next/navigation'

// Third-party libraries
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { Control, ControllerRenderProps, ControllerFieldState } from 'react-hook-form'
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
  FieldContent,
  FieldError,
  FieldSeparator,
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldTitle,
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
import { Plus, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Stepper } from '@/components/ui/stepper'

import { CapWidget } from '@/components/common/cap-widget'
import {
  formSchema,
  type FormValues,
  type EventOption,
  GENDER_OPTIONS,
  PICKUP_OPTIONS,
} from './schema'
import { useKnallbonbonEvents } from './useKnallbonbonEvents'
import { submitKnallbonbonRegistration } from './actions'

import { PhoneInput } from '@/components/ui/phone-input'
import { DatePickerInput } from '@/components/ui/date-picker-input'

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_CHILDREN = 5

const INITIAL_CHILD_VALUES = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  photoConsent: false,
  gender: '',
  healthInfo: '',
  pickupInfo: '',
}

const STEPS = [
  { label: 'Veranstaltung' },
  { label: 'Kontakt' },
  { label: 'Kinder' },
  { label: 'Überprüfen' },
]

type StepFields = (keyof FormValues)[]

const STEP_FIELDS: Record<number, StepFields> = {
  1: ['event'],
  2: ['firstName', 'lastName', 'address', 'postalCode', 'city', 'phone', 'email'],
  3: ['child'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function calcAgeAtDate(dateOfBirth: string, eventDate: string): number | null {
  try {
    const birth = new Date(dateOfBirth)
    const ref = new Date(eventDate)
    if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return null
    let age = ref.getFullYear() - birth.getFullYear()
    const m = ref.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
    return age
  } catch {
    return null
  }
}

function formatDateLabel(dateOfBirth: string): string {
  if (!dateOfBirth) return '–'
  // German format dd.MM.yyyy
  if (dateOfBirth.includes('.')) return dateOfBirth
  try {
    const d = new Date(dateOfBirth)
    if (isNaN(d.getTime())) return dateOfBirth
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateOfBirth
  }
}

// ─── DateOfBirthField ────────────────────────────────────────────────────────

type DateOfBirthFieldProps = {
  field: ControllerRenderProps<FormValues, `child.${number}.dateOfBirth`>
  fieldState: ControllerFieldState
  index: number
  minAge?: number
  maxAge?: number
  eventDate?: string
  onAgeError: (index: number, hasError: boolean) => void
}

function DateOfBirthField({
  field,
  fieldState,
  index,
  minAge,
  maxAge,
  eventDate,
  onAgeError,
}: DateOfBirthFieldProps) {
  const ageError = useMemo(() => {
    if (!field.value || !eventDate) return null
    let isoDate = field.value
    if (field.value.includes('.')) {
      const parts = field.value.split('.')
      if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
    const age = calcAgeAtDate(isoDate, eventDate)
    if (age === null) return null
    if (minAge !== undefined && age < minAge) {
      return `Das Kind muss mindestens ${minAge} Jahre alt sein (Alter zum Veranstaltungsdatum: ${age}).`
    }
    if (maxAge !== undefined && age > maxAge) {
      return `Das Kind darf höchstens ${maxAge} Jahre alt sein (Alter zum Veranstaltungsdatum: ${age}).`
    }
    return null
  }, [field.value, eventDate, minAge, maxAge])

  useEffect(() => {
    onAgeError(index, ageError !== null)
  }, [ageError, index, onAgeError])

  const isInvalid = fieldState.invalid || ageError !== null
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={`date-of-birth-child-${index}`}>Geburtsdatum</FieldLabel>
      <DatePickerInput
        id={`date-of-birth-child-${index}`}
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        invalid={isInvalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      {!fieldState.invalid && ageError && <FieldError errors={[{ message: ageError }]} />}
    </Field>
  )
}

// ─── ChildFieldset ───────────────────────────────────────────────────────────

type ChildFieldsetProps = {
  control: Control<FormValues>
  index: number
  onRemove: (index: number) => void
  canRemove: boolean
  minAge?: number
  maxAge?: number
  eventDate?: string
  onAgeError: (index: number, hasError: boolean) => void
}

const ChildFieldset = memo(function ChildFieldset({
  control,
  index,
  onRemove,
  canRemove,
  minAge,
  maxAge,
  eventDate,
  onAgeError,
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
          <DateOfBirthField
            field={field}
            fieldState={fieldState}
            index={index}
            minAge={minAge}
            maxAge={maxAge}
            eventDate={eventDate}
            onAgeError={onAgeError}
          />
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

// ─── SummaryRow ───────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="text-muted-foreground min-w-32 text-sm">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

// ─── ReviewStep ──────────────────────────────────────────────────────────────

type ReviewStepProps = {
  values: FormValues
  selectedEvent: EventOption | undefined
}

function ReviewStep({ values, selectedEvent }: ReviewStepProps) {
  const genderLabel = (g: string) => GENDER_OPTIONS.find((o) => o.value === g)?.label ?? g
  const pickupLabel = (p: string) => PICKUP_OPTIONS.find((o) => o.value === p)?.label ?? p

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLegend variant="legend">Veranstaltung</FieldLegend>
        <div className="space-y-1">
          <SummaryRow
            label="Termin"
            value={
              selectedEvent ? `${selectedEvent.title} – ${selectedEvent.dateLabel}` : values.event
            }
          />
        </div>
      </div>

      <FieldSeparator />

      <div className="space-y-2">
        <FieldLegend variant="legend">Kontakt</FieldLegend>
        <div className="space-y-1">
          <SummaryRow label="Name" value={`${values.firstName} ${values.lastName}`} />
          <SummaryRow label="E-Mail" value={values.email} />
          <SummaryRow label="Telefon" value={values.phone} />
          <SummaryRow label="Adresse" value={values.address} />
          <SummaryRow label="PLZ" value={values.postalCode} />
          <SummaryRow label="Stadt" value={values.city} />
        </div>
      </div>

      <FieldSeparator />

      <div className="space-y-4">
        <FieldLegend variant="legend">Kinder</FieldLegend>
        {values.child.map((child, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm font-medium">
              {i + 1}. {child.firstName} {child.lastName}
            </p>
            <div className="space-y-1 pl-4">
              <SummaryRow label="Geburtsdatum" value={formatDateLabel(child.dateOfBirth)} />
              <SummaryRow label="Geschlecht" value={genderLabel(child.gender)} />
              <SummaryRow label="Abholung" value={pickupLabel(child.pickupInfo)} />
              <SummaryRow
                label="Fotos"
                value={child.photoConsent ? 'Einwilligung erteilt' : 'Keine Einwilligung'}
              />
              {child.healthInfo && <SummaryRow label="Gesundheit" value={child.healthInfo} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Form ───────────────────────────────────────────────────────────────

/**
 * Renders the Knallbonbon event registration form as a 4-step wizard.
 *
 * Steps:
 *  1. Veranstaltung – event selection
 *  2. Kontakt – parent/guardian contact info
 *  3. Kinder – child entries with age validation
 *  4. Überprüfen & Absenden – read-only summary, CAPTCHA, submit
 *
 * A single useForm instance spans all steps so data is preserved when navigating back.
 * Clicking "Weiter" validates only the current step's fields before advancing.
 */
export function KnallbonbonAnmeldungForm() {
  const { eventOptions, loading } = useKnallbonbonEvents()
  const searchParams = useSearchParams()
  const eventFromUrl = searchParams.get('event')

  const [currentStep, setCurrentStep] = useState(1)

  // Track age errors per child index
  const [childAgeErrors, setChildAgeErrors] = useState<Record<number, boolean>>({})
  const hasAgeErrors = Object.values(childAgeErrors).some(Boolean)

  const handleAgeError = useCallback((index: number, hasError: boolean) => {
    setChildAgeErrors((prev) => {
      if (prev[index] === hasError) return prev
      return { ...prev, [index]: hasError }
    })
  }, [])

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
      postalCode: '',
      city: '',
      captchaToken: '',
      event: eventFromUrl || '',
      child: [INITIAL_CHILD_VALUES],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'child',
  })

  // Debounced validation for email/phone
  const validateEmail = useCallback(() => form.trigger('email'), [form])
  const validatePhone = useCallback(() => form.trigger('phone'), [form])
  const debouncedEmailValidation = useDebounceValidation(validateEmail, 500)
  const debouncedPhoneValidation = useDebounceValidation(validatePhone, 500)

  const handleRemoveChild = useCallback(
    (index: number) => {
      remove(index)
      setChildAgeErrors((prev) => {
        const next: Record<number, boolean> = {}
        Object.entries(prev).forEach(([key, val]) => {
          const k = Number(key)
          if (k < index) next[k] = val
          else if (k > index) next[k - 1] = val
        })
        return next
      })
    },
    [remove],
  )

  const selectedEventId = form.watch('event')
  const selectedEvent = useMemo(
    () => eventOptions.find((e) => e.id === selectedEventId),
    [eventOptions, selectedEventId],
  )

  const eventRadioOptions = useMemo(
    () =>
      eventOptions.map((eventOption) => (
        <FieldLabel
          key={eventOption.id}
          htmlFor={`event-${eventOption.id}`}
          className="block cursor-pointer rounded-md border"
        >
          <Field orientation="horizontal" className="flex items-start gap-3">
            <FieldContent>
              <FieldTitle className="font-normal">
                {eventOption.title} – {eventOption.dateLabel}
              </FieldTitle>
              {eventOption.isFull ? (
                <FieldDescription className="text-primary">
                  Ausgebucht – Anmeldung auf Warteliste möglich
                </FieldDescription>
              ) : eventOption.maxParticipants !== undefined && eventOption.maxParticipants > 0 ? (
                <FieldDescription>{eventOption.freeSpots} Plätze frei</FieldDescription>
              ) : null}
              {(eventOption.minAge !== undefined || eventOption.maxAge !== undefined) && (
                <FieldDescription>
                  {eventOption.minAge !== undefined && eventOption.maxAge !== undefined
                    ? `Alter: ${eventOption.minAge}–${eventOption.maxAge} Jahre`
                    : eventOption.minAge !== undefined
                      ? `Mindestalter: ${eventOption.minAge} Jahre`
                      : `Höchstalter: ${eventOption.maxAge} Jahre`}
                </FieldDescription>
              )}
            </FieldContent>
            <RadioGroupItem
              value={eventOption.id}
              id={`event-${eventOption.id}`}
              disabled={!eventOption.id}
            />
          </Field>
        </FieldLabel>
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

  const handleNext = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep]
    if (fields) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    setCurrentStep((s) => s + 1)
  }, [currentStep, form])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => s - 1)
  }, [])

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
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
            return { ...child, dateOfBirth: isoDateOfBirth }
          }),
        }

        const result = await submitKnallbonbonRegistration(transformedValues)

        if (result.success) {
          form.reset()
          setCurrentStep(1)
          if (result.isWaitlist) {
            toast.success(
              'Anmeldung auf Warteliste erfolgreich! Du erhältst eine E-Mail, sobald ein Platz frei wird.',
            )
          } else {
            toast.success('Anmeldung erfolgreich!')
          }
        } else {
          if (result.error === 'invalid-captcha') {
            toast.error('Bitte bestätigen Sie die Captcha-Prüfung erneut.')
            form.setValue('captchaToken', '', { shouldValidate: true })
            return
          }
          const message = typeof result.message === 'string' ? result.message : undefined
          toast.error(message ?? 'Fehler bei der Anmeldung.')
        }
      } catch (error) {
        console.error('Form submission error:', error)
        toast.error('Netzwerkfehler. Bitte versuchen Sie es später erneut.')
      }
    },
    [form],
  )

  const formValues = form.watch()

  return (
    <>
      <Toaster richColors />
      <CardHeader>
        <CardTitle>Knallbonbon Anmeldung</CardTitle>
        <CardDescription>
          Hier können Sie sich für unser Knallbonbon Event anmelden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Stepper steps={STEPS} currentStep={currentStep} />

        <form id="knallbonbon-form" onSubmit={form.handleSubmit(onSubmit)}>
          {/* ── Step 1: Veranstaltung ── */}
          {currentStep === 1 && (
            <FieldGroup>
              <FieldSet>
                <Controller
                  control={form.control}
                  name="event"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Veranstaltung auswählen</FieldLabel>
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
            </FieldGroup>
          )}

          {/* ── Step 2: Kontakt ── */}
          {currentStep === 2 && (
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Kontaktdaten</FieldLegend>
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
                <FieldGroup className="flex flex-col gap-4 md:flex-row md:space-y-0">
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
                </FieldGroup>
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
            </FieldGroup>
          )}

          {/* ── Step 3: Kinder ── */}
          {currentStep === 3 && (
            <FieldGroup>
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
                      minAge={selectedEvent?.minAge}
                      maxAge={selectedEvent?.maxAge}
                      eventDate={selectedEvent?.date}
                      onAgeError={handleAgeError}
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
                {hasAgeErrors && (
                  <p className="text-destructive text-sm">
                    Ein oder mehrere Kinder erfüllen nicht die Altersvoraussetzungen für diese
                    Veranstaltung.
                  </p>
                )}
              </FieldSet>
            </FieldGroup>
          )}

          {/* ── Step 4: Überprüfen & Absenden ── */}
          {currentStep === 4 && (
            <FieldGroup>
              <ReviewStep values={formValues} selectedEvent={selectedEvent} />
              <FieldSeparator />
              <FieldSet>
                <Field data-invalid={Boolean(form.formState.errors.captchaToken)}>
                  <FieldLabel>Spam-Schutz</FieldLabel>
                  <input type="hidden" {...form.register('captchaToken')} />
                  <CapWidget
                    endpoint={
                      process.env.NEXT_PUBLIC_CAPTCHA_URL || 'https://captcha.gurl.eu.org/api/'
                    }
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
          )}
        </form>
      </CardContent>

      {/* ── Navigation ── */}
      <CardFooter className="flex justify-between gap-3">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ChevronLeft className="size-4" />
            Zurück
          </Button>
        ) : (
          <div />
        )}
        {currentStep < 4 ? (
          <Button type="button" onClick={handleNext} disabled={loading && currentStep === 1}>
            Weiter
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            form="knallbonbon-form"
            disabled={form.formState.isSubmitting || !form.watch('captchaToken') || hasAgeErrors}
          >
            <Send className="size-4" />
            {form.formState.isSubmitting ? 'Senden...' : 'Anmeldung absenden'}
          </Button>
        )}
      </CardFooter>
      {currentStep === 4 && (
        <CardFooter>
          <CardDescription>
            Nach dem Absenden der Anmeldung erhalten Sie eine Bestätigungs-E-Mail. Bitte prüfen Sie
            auch Ihren Spam-Ordner.
          </CardDescription>
        </CardFooter>
      )}
    </>
  )
}
