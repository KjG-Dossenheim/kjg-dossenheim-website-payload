'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Item, ItemGroup, ItemContent, ItemActions } from '@/components/ui/item'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Plus, Trash } from 'lucide-react'

import type { SommerfreizeitAnmeldung } from '@/payload-types'
import { updateAnmeldungAction } from './actions'
import type { UpdateAnmeldungInput } from '@/utilities/validation/sommerfreizeit'

type EditFormProps = {
  anmeldung: SommerfreizeitAnmeldung
  anmeldungId: string
  childName: string
}

const krankenversicherungArtLabels = {
  gesetzlich: 'Gesetzlich',
  privat: 'Privat',
} as const

const schwimmabzeichenLabels = {
  seepferdchen: 'Seepferdchen',
  bronze: 'Bronze',
  silber: 'Silber',
  gold: 'Gold',
} as const

type EditFormState = {
  krankenversicherung: string
  krankenversicherungArt: SommerfreizeitAnmeldung['krankenversicherungArt']
  krankenversicherungNummer: string
  krankenkassenKarte: boolean
  impfpass: boolean
  foodAllergies: string
  foodPreferences: SommerfreizeitAnmeldung['foodPreferences']
  otherAllergies: string
  medicalConditions: string
  medikamente: string
  arzt: string
  arztTelefon: string
  hausarztmodell: boolean
  schwimmer: boolean
  schwimmabzeichen: SommerfreizeitAnmeldung['schwimmabzeichen']
  bemerkungen: string
  zimmerwunsch: SommerfreizeitAnmeldung['zimmerwunsch']
}

function buildInitialState(anmeldung: SommerfreizeitAnmeldung): EditFormState {
  return {
    krankenversicherung: anmeldung.krankenversicherung ?? '',
    krankenversicherungArt: anmeldung.krankenversicherungArt ?? undefined,
    krankenversicherungNummer: anmeldung.krankenversicherungNummer ?? '',
    krankenkassenKarte: anmeldung.krankenkassenKarte ?? false,
    impfpass: anmeldung.impfpass ?? false,
    foodAllergies: anmeldung.foodAllergies ?? '',
    foodPreferences: anmeldung.foodPreferences ?? 'none',
    otherAllergies: anmeldung.otherAllergies ?? '',
    medicalConditions: anmeldung.medicalConditions ?? '',
    medikamente: anmeldung.medikamente ?? '',
    arzt: anmeldung.arzt ?? '',
    arztTelefon: anmeldung.arztTelefon ?? '',
    hausarztmodell: anmeldung.hausarztmodell ?? false,
    schwimmer: anmeldung.schwimmer ?? false,
    schwimmabzeichen: anmeldung.schwimmabzeichen ?? null,
    bemerkungen: anmeldung.bemerkungen ?? '',
    zimmerwunsch: anmeldung.zimmerwunsch ?? [],
  }
}

export function EditForm({ anmeldung, anmeldungId, childName }: EditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<EditFormState>(() => buildInitialState(anmeldung))

  const updateField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const payload: UpdateAnmeldungInput = {
        krankenversicherung: formData.krankenversicherung,
        krankenversicherungArt: formData.krankenversicherungArt ?? null,
        krankenversicherungNummer: formData.krankenversicherungNummer,
        krankenkassenKarte: formData.krankenkassenKarte,
        impfpass: formData.impfpass,
        foodAllergies: formData.foodAllergies,
        foodPreferences: formData.foodPreferences,
        otherAllergies: formData.otherAllergies,
        medicalConditions: formData.medicalConditions,
        medikamente: formData.medikamente,
        arzt: formData.arzt,
        arztTelefon: formData.arztTelefon,
        hausarztmodell: formData.hausarztmodell,
        schwimmer: formData.schwimmer,
        schwimmabzeichen: formData.schwimmabzeichen,
        bemerkungen: formData.bemerkungen,
        zimmerwunsch:
          formData.zimmerwunsch?.map((zw) => ({
            firstName: zw.firstName,
            lastName: zw.lastName ?? undefined,
          })) ?? [],
      }

      const result = await updateAnmeldungAction(anmeldungId, payload)

      if (!result.success) {
        toast.error(result.message, { toasterId: 'edit-anmeldung', closeButton: true })
        return
      }

      toast.success(result.message, { toasterId: 'edit-anmeldung', closeButton: true })
      router.refresh()
    })
  }

  const isFormValid =
    formData.krankenversicherung.trim().length > 0 &&
    formData.krankenversicherungArt != null &&
    formData.arzt.trim().length > 0 &&
    formData.arztTelefon.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        {/* ─── Krankenkasse ─── */}
        <FieldSet>
          <FieldLegend>Krankenkasse</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="krankenversicherung" required>
                Krankenversicherung
              </FieldLabel>
              <Input
                id="krankenversicherung"
                value={formData.krankenversicherung}
                onChange={(e) => updateField('krankenversicherung', e.target.value)}
                required
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="krankenversicherungArt" required>
                Versicherungsart
              </FieldLabel>
              <Select
                value={formData.krankenversicherungArt ?? ''}
                onValueChange={(value) =>
                  updateField(
                    'krankenversicherungArt',
                    (value as SommerfreizeitAnmeldung['krankenversicherungArt']) ?? null,
                  )
                }
                required
                disabled={isPending}
              >
                <SelectTrigger
                  id="krankenversicherungArt"
                  aria-label="Versicherungsart"
                  className="w-full"
                >
                  <SelectValue>
                    {(value) =>
                      krankenversicherungArtLabels[
                        value as keyof typeof krankenversicherungArtLabels
                      ] ?? value
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="gesetzlich" label="Gesetzlich">
                      Gesetzlich
                    </SelectItem>
                    <SelectItem value="privat" label="Privat">
                      Privat
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="krankenversicherungNummer">Versichertennummer</FieldLabel>
              <Input
                id="krankenversicherungNummer"
                value={formData.krankenversicherungNummer}
                onChange={(e) => updateField('krankenversicherungNummer', e.target.value)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
          <FieldSet>
            <FieldGroup data-slot="checkbox-group">
              <Field orientation="horizontal">
                <Checkbox
                  id="krankenkassenKarte"
                  checked={formData.krankenkassenKarte}
                  onCheckedChange={(checked) => updateField('krankenkassenKarte', checked === true)}
                  disabled={isPending}
                />
                <FieldContent>
                  <FieldLabel htmlFor="krankenkassenKarte">Krankenkassenkarte vorhanden</FieldLabel>
                  <FieldDescription>
                    {childName} hat eine Krankenkassenkarte und bringt sie mit.
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="impfpass"
                  checked={formData.impfpass}
                  onCheckedChange={(checked) => updateField('impfpass', checked === true)}
                  disabled={isPending}
                />
                <FieldContent>
                  <FieldLabel htmlFor="impfpass">Impfpass vorhanden</FieldLabel>
                  <FieldDescription>
                    {childName} hat einen Impfpass und bringt ihn mit.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldSet>

        {/* ─── Ernährung ─── */}
        <FieldSet>
          <FieldLegend>Ernährung</FieldLegend>
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="foodAllergies">Lebensmittelallergien</FieldLabel>
              <Textarea
                id="foodAllergies"
                value={formData.foodAllergies}
                onChange={(e) => updateField('foodAllergies', e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="foodPreferences">Ernährungspräferenzen</FieldLabel>
              <RadioGroup
                id="foodPreferences"
                value={formData.foodPreferences ?? 'none'}
                onValueChange={(value) =>
                  updateField(
                    'foodPreferences',
                    value as SommerfreizeitAnmeldung['foodPreferences'],
                  )
                }
              >
                <Field orientation="horizontal">
                  <RadioGroupItem value="none" id="food-none" disabled={isPending} />
                  <FieldContent>
                    <FieldLabel htmlFor="food-none">Keine</FieldLabel>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="vegetarisch" id="food-vegetarisch" disabled={isPending} />
                  <FieldContent>
                    <FieldLabel htmlFor="food-vegetarisch">Vegetarisch</FieldLabel>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="vegan" id="food-vegan" disabled={isPending} />
                  <FieldContent>
                    <FieldLabel htmlFor="food-vegan">Vegan</FieldLabel>
                  </FieldContent>
                </Field>
              </RadioGroup>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otherAllergies">Sonstige Allergien</FieldLabel>
              <Textarea
                id="otherAllergies"
                value={formData.otherAllergies}
                onChange={(e) => updateField('otherAllergies', e.target.value)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* ─── Medizinisches ─── */}
        <FieldSet>
          <FieldLegend>Medizinisches</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="medicalConditions">Vorerkrankungen</FieldLabel>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => updateField('medicalConditions', e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medikamente">Medikamente</FieldLabel>
              <Textarea
                id="medikamente"
                value={formData.medikamente}
                onChange={(e) => updateField('medikamente', e.target.value)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* ─── Ärztliche Versorgung ─── */}
        <FieldSet>
          <FieldLegend>Ärztliche Versorgung</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="arzt" required>
                Arzt
              </FieldLabel>
              <Input
                id="arzt"
                value={formData.arzt}
                onChange={(e) => updateField('arzt', e.target.value)}
                required
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="arztTelefon" required>
                Arzt-Telefonnummer
              </FieldLabel>
              <PhoneInput
                id="arztTelefon"
                value={formData.arztTelefon}
                onChange={(value) => updateField('arztTelefon', value ?? '')}
                required
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox
                id="hausarztmodell"
                checked={formData.hausarztmodell}
                onCheckedChange={(checked) => updateField('hausarztmodell', checked === true)}
                disabled={isPending}
              />
              <FieldContent>
                <FieldLabel htmlFor="hausarztmodell">Hausarztmodell</FieldLabel>
                <FieldDescription>
                  Bitte gib an, ob {childName} am{' '}
                  <Link
                    href="https://www.bundesgesundheitsministerium.de/hausarztsystem"
                    target="_blank"
                    rel="noopener"
                  >
                    Hausarztmodell
                  </Link>{' '}
                  teilnimmt.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* ─── Zimmerwunsch ─── */}
        <FieldSet>
          <FieldLegend>Zimmerwunsch</FieldLegend>
          <Field>
            <ItemGroup>
              {(formData.zimmerwunsch || []).map((roomMate, roomIndex) => (
                <Item key={roomIndex} size="sm" variant="outline">
                  <ItemContent className="flex gap-1 sm:flex-row">
                    <Input
                      placeholder="Vorname"
                      value={roomMate.firstName || ''}
                      onChange={(e) => {
                        const updated = [...(formData.zimmerwunsch || [])]
                        updated[roomIndex] = {
                          ...updated[roomIndex],
                          firstName: e.target.value,
                        }
                        updateField('zimmerwunsch', updated)
                      }}
                      disabled={isPending}
                      required
                    />
                    <Input
                      placeholder="Nachname (optional)"
                      value={roomMate.lastName || ''}
                      onChange={(e) => {
                        const updated = [...(formData.zimmerwunsch || [])]
                        updated[roomIndex] = {
                          ...updated[roomIndex],
                          lastName: e.target.value,
                        }
                        updateField('zimmerwunsch', updated)
                      }}
                      disabled={isPending}
                    />
                  </ItemContent>
                  <ItemActions>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = (formData.zimmerwunsch || []).filter(
                          (_, i) => i !== roomIndex,
                        )
                        updateField('zimmerwunsch', updated)
                      }}
                      disabled={isPending}
                      aria-label="Zimmerwunsch entfernen"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </ItemActions>
                </Item>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = [
                    ...(formData.zimmerwunsch || []),
                    { firstName: '', lastName: '' },
                  ]
                  updateField('zimmerwunsch', updated)
                }}
                disabled={isPending}
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                Zimmerwunsch hinzufügen
              </Button>
            </ItemGroup>
          </Field>
        </FieldSet>

        {/* ─── Programm ─── */}
        <FieldSet>
          <FieldLegend>Programm</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field orientation="horizontal">
              <Checkbox
                id="schwimmer"
                checked={formData.schwimmer}
                onCheckedChange={(checked) => updateField('schwimmer', checked === true)}
                disabled={isPending}
              />
              <FieldContent>
                <FieldLabel htmlFor="schwimmer">{childName} kann schwimmen</FieldLabel>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="schwimmabzeichen">Schwimmabzeichen</FieldLabel>
              <Select
                value={formData.schwimmabzeichen ?? ''}
                onValueChange={(value) =>
                  updateField(
                    'schwimmabzeichen',
                    value ? (value as SommerfreizeitAnmeldung['schwimmabzeichen']) : null,
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger
                  id="schwimmabzeichen"
                  aria-label="Schwimmabzeichen"
                  className="w-full"
                >
                  <SelectValue placeholder="Kein Abzeichen">
                    {(value) =>
                      value
                        ? (schwimmabzeichenLabels[value as keyof typeof schwimmabzeichenLabels] ??
                          value)
                        : 'Kein Abzeichen'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">Kein Abzeichen</SelectItem>
                    <SelectItem value="seepferdchen">Seepferdchen</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silber">Silber</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* ─── Sonstiges ─── */}
        <FieldSet>
          <FieldLegend>Sonstiges</FieldLegend>
          <Field>
            <FieldLabel htmlFor="bemerkungen">Weitere Hinweise</FieldLabel>
            <Textarea
              id="bemerkungen"
              value={formData.bemerkungen}
              onChange={(e) => updateField('bemerkungen', e.target.value)}
              disabled={isPending}
            />
          </Field>
        </FieldSet>
      </FieldGroup>

      <Card>
        <CardHeader>
          <CardTitle>Änderungen speichern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Überprüfe deine Angaben und speichere die Änderungen.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Link href="/sommerfreizeit/account" className={buttonVariants({ variant: 'outline' })}>
            Abbrechen
          </Link>
          <Button type="submit" disabled={isPending || !isFormValid}>
            {isPending ? 'Wird gespeichert…' : 'Speichern'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
