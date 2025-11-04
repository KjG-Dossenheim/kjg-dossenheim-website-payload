'use client'

// React and React Hooks
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

// Third-party libraries
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

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
import { CalendarIcon, Plus, Send, Trash2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { de } from 'react-day-picker/locale'
import { Textarea } from '@/components/ui/textarea'

import { CapWidget } from '@/components/common/cap-widget'
import { formSchema, type FormValues } from './schema'

type EventOption = {
  id: string
  title: string
  dateLabel: string
}

const displayDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function parseIsoDate(value?: string) {
  if (!value) return undefined
  const [yearStr, monthStr, dayStr] = value.split('-')
  if (!yearStr || !monthStr || !dayStr) return undefined
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return undefined
  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined
  }
  return parsed
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type DatePickerInputProps = {
  id: string
  name: string
  value: string | undefined
  onChange: (value: string) => void
  onBlur: () => void
  inputRef: React.Ref<HTMLInputElement>
  invalid: boolean
}

function DatePickerInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  invalid,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const parsedDate = useMemo(() => parseIsoDate(value), [value])
  const [month, setMonth] = useState<Date>(() => parsedDate ?? new Date())

  useEffect(() => {
    if (parsedDate) {
      setMonth(parsedDate)
    } else {
      setMonth(new Date())
    }
  }, [parsedDate])

  const displayValue = parsedDate ? displayDateFormatter.format(parsedDate) : ''

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        name={name}
        ref={inputRef}
        value={displayValue}
        readOnly
        aria-invalid={invalid}
        autoComplete="bday"
        onBlur={onBlur}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Datum auswählen</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            locale={de}
            selected={parsedDate}
            month={month}
            captionLayout="dropdown"
            onMonthChange={setMonth}
            onSelect={(selectedDate) => {
              if (!selectedDate) {
                onChange('')
                return
              }
              setMonth(selectedDate)
              onChange(formatIsoDate(selectedDate))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function KnallbonbonAnmeldungPage() {
  const [eventOptions, setEventOptions] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      event: '',
      address: '',
      captchaToken: '',
      child: [
        {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          photoConsent: false,
          gender: 'noInfo',
          healthInfo: '',
          pickupInfo: undefined,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'child',
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

        const formattedOptions = (data as KnallbonbonEventResponse).docs.map((event) => {
          const eventDate = event.date ? new Date(event.date) : null
          const dateLabel = eventDate
            ? eventDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Datum unbekannt'

          return {
            id: event.id,
            title: String(event.title || event.name || 'Unbekannte Veranstaltung'),
            dateLabel,
          }
        })
        setEventOptions(formattedOptions)
      } catch (error) {
        console.error(error)
        setEventOptions([
          { id: '', title: 'Fehler beim Laden der Events', dateLabel: 'Datum unbekannt' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleRemoveChild = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove],
  )

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch('/knallbonbon/anmeldung/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      >
                        {eventOptions.map((opt) => (
                          <Field
                            orientation="horizontal"
                            key={opt.id}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <RadioGroupItem
                              value={opt.id}
                              id={`event-${opt.id}`}
                              disabled={!opt.id}
                            />
                            <FieldLabel htmlFor={`event-${opt.id}`} className="font-normal">
                              {opt.title} – {opt.dateLabel}
                            </FieldLabel>
                          </Field>
                        ))}
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
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Notfallnummer</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="tel"
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
                onClick={() =>
                  append({
                    firstName: '',
                    lastName: '',
                    dateOfBirth: '',
                    photoConsent: false,
                    gender: 'noInfo',
                    healthInfo: '',
                    pickupInfo: undefined,
                  })
                }
                disabled={fields.length >= 5}
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
                  onSolve={(token) => {
                    form.setValue('captchaToken', token ?? '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
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
    </section>
  )
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
        <FieldLegend variant="legend">Kind {index + 1}</FieldLegend>
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
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`gender-child-${index}`} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
                <SelectItem value="diverse">Divers</SelectItem>
                <SelectItem value="noInfo">Keine Angabe</SelectItem>
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
              onValueChange={field.onChange}
              aria-invalid={fieldState.invalid}
            >
              <Field orientation="horizontal" className="flex cursor-pointer items-center gap-2">
                <RadioGroupItem value="pickedUp" id={`pickup-picked-up-${index}`} />
                <FieldLabel htmlFor={`pickup-picked-up-${index}`} className="font-normal">
                  Wird abgeholt
                </FieldLabel>
              </Field>
              <Field orientation="horizontal" className="flex cursor-pointer items-center gap-2">
                <RadioGroupItem value="goesAlone" id={`pickup-goes-alone-${index}`} />
                <FieldLabel htmlFor={`pickup-goes-alone-${index}`} className="font-normal">
                  Darf alleine nach Hause gehen
                </FieldLabel>
              </Field>
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
                onCheckedChange={(checked) => field.onChange(checked === true)}
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
