'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Item, ItemGroup, ItemContent, ItemActions } from '@/components/ui/item'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import type { SommerfreizeitAnmeldung, SommerfreizeitChild } from '@/payload-types'

import { completeOrderCheckAction, getOrderFlowView } from '../action'
import { Pen, RefreshCw, Trash, Plus } from 'lucide-react'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'

type PositionView = {
  positionId: string
  firstName: string
  lastName: string
  pretixOrderID: string
  pretixSecret: string
}

type CheckFormProps = {
  accountDefaults: {
    phone: string
    address: string
    postalCode: string
    city: string
  }
  orderCode: string
  pretixOrderID: string
  pretixSecret: string
  pretixEvent: string
  positions: PositionView[]
  showAccountCreatedMessage: boolean
}

type ChildFormState = {
  positionId: string
  pretixOrderID: string
  pretixSecret: string
  firstName: SommerfreizeitChild['firstName']
  lastName: SommerfreizeitChild['lastName']
  dateOfBirth: string
  gender: SommerfreizeitChild['gender']
  class: SommerfreizeitAnmeldung['class']
  krankenversicherung: string
  krankenversicherungArt: SommerfreizeitAnmeldung['krankenversicherungArt']
  krankenversicherungNummer: string
  krankenkassenKarte: SommerfreizeitAnmeldung['krankenkassenKarte']
  foodAllergies: string
  otherAllergies: string
  medicalConditions: string
  medikamente: string
  medikamenteArray: SommerfreizeitAnmeldung['medikamenteArray']
  arzt: string
  arztTelefon: string
  hausarztmodell: SommerfreizeitAnmeldung['hausarztmodell']
  schwimmer: SommerfreizeitAnmeldung['krankenkassenKarte']
  schwimmabzeichen: SommerfreizeitAnmeldung['schwimmabzeichen']
  bemerkungen: string
  impfpass: SommerfreizeitAnmeldung['impfpass']
  zimmerwunsch: SommerfreizeitAnmeldung['zimmerwunsch']
  foodPreferences: SommerfreizeitAnmeldung['foodPreferences']
  agbAkzeptiert: SommerfreizeitAnmeldung['agbAkzeptiert']
  datenschutzAkzeptiert: SommerfreizeitAnmeldung['datenschutzAkzeptiert']
  bildrechte: SommerfreizeitAnmeldung['bildrechte']
}

const genderLabels = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
} as const

const classLabels = {
  '3': '3. Klasse',
  '4': '4. Klasse',
  '5': '5. Klasse',
  '6': '6. Klasse',
  '7': '7. Klasse',
  '8': '8. Klasse',
  '9': '9. Klasse',
  '10': '10. Klasse',
} as const

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

function buildInitialChild(position: PositionView): ChildFormState {
  return {
    positionId: position.positionId,
    pretixOrderID: position.pretixOrderID,
    pretixSecret: position.pretixSecret,
    firstName: position.firstName,
    lastName: position.lastName,
    dateOfBirth: '',
    gender: undefined,
    class: undefined,
    krankenversicherung: '',
    krankenversicherungArt: undefined,
    krankenversicherungNummer: '',
    krankenkassenKarte: false,
    foodAllergies: '',
    otherAllergies: '',
    medicalConditions: '',
    medikamente: '',
    medikamenteArray: undefined,
    arzt: '',
    arztTelefon: '',
    hausarztmodell: false,
    schwimmer: false,
    schwimmabzeichen: undefined,
    bemerkungen: '',
    zimmerwunsch: [],
    impfpass: false,
    foodPreferences: undefined,
    agbAkzeptiert: false,
    datenschutzAkzeptiert: false,
    bildrechte: 'no',
  }
}

export function CheckForm({
  accountDefaults,
  orderCode,
  pretixOrderID,
  pretixSecret,
  pretixEvent,
  positions,
  showAccountCreatedMessage,
}: CheckFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone, setPhone] = useState(accountDefaults.phone)
  const [address, setAddress] = useState(accountDefaults.address)
  const [postalCode, setPostalCode] = useState(accountDefaults.postalCode)
  const [city, setCity] = useState(accountDefaults.city)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [children, setChildren] = useState<ChildFormState[]>(() =>
    positions.map((position) => buildInitialChild(position)),
  )
  useEffect(() => {
    if (showAccountCreatedMessage) {
      toast.success('Für diese Bestellung wurde ein Konto angelegt.')
    }
  }, [showAccountCreatedMessage])
  const canSubmit = children.length > 0
  const pretixModifyHref = `${process.env.NEXT_PUBLIC_PRETIX_URL}/${process.env.NEXT_PUBLIC_PRETIX_ORGANIZER}/${pretixEvent}/order/${pretixOrderID}/${pretixSecret}/modify`
  const updateChild = <K extends keyof ChildFormState>(
    index: number,
    key: K,
    value: ChildFormState[K],
  ) => {
    setChildren((prev) => {
      const clone = [...prev]
      clone[index] = {
        ...clone[index],
        [key]: value,
      }
      return clone
    })
  }

  const handleRefresh = () => {
    // clear previous notifications handled via toasts

    startTransition(async () => {
      setIsRefreshing(true)

      try {
        const flow = await getOrderFlowView({ orderCode })

        if (!flow) {
          toast.error('Die Bestellung konnte nicht geladen werden.')
          return
        }

        // Reconcile positions by positionId — preserve existing editable fields
        const refreshed = flow.positions

        const newChildren: ChildFormState[] = refreshed.map((pos) => {
          const existing = children.find((c) => c.positionId === pos.positionId)

          if (existing) {
            return {
              ...existing,
              firstName: pos.firstName,
              lastName: pos.lastName,
              pretixOrderID: pos.pretixOrderID,
              pretixSecret: pos.pretixSecret,
            }
          }

          return buildInitialChild(pos)
        })

        // Detect removed positions
        const removed = children.filter(
          (c) => !refreshed.some((p) => p.positionId === c.positionId),
        )

        setChildren(newChildren)

        if (removed.length > 0) {
          toast.error(
            `Einige Positionen wurden in Pretix entfernt (${removed.length}). Die Bestellung wurde aktualisiert.`,
          )
        } else {
          toast.success('Die Bestellung wurde aktualisiert.')
        }
      } catch (_err) {
        toast.error('Beim Aktualisieren ist ein Fehler aufgetreten. Bitte versuche es erneut.')
      } finally {
        setIsRefreshing(false)
      }
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // previous notifications are handled via toasts

    startTransition(async () => {
      const result = await completeOrderCheckAction({
        orderCode,
        phone,
        address,
        postalCode,
        city,
        children: children.map((child) => ({
          positionId: child.positionId,
          firstName: child.firstName,
          lastName: child.lastName,
          dateOfBirth: child.dateOfBirth,
          gender: child.gender,
          class: child.class,
          krankenversicherung: child.krankenversicherung,
          krankenversicherungArt: child.krankenversicherungArt ?? null,
          krankenversicherungNummer: child.krankenversicherungNummer,
          krankenkassenKarte: child.krankenkassenKarte,
          foodAllergies: child.foodAllergies,
          foodPreferences: child.foodPreferences,
          otherAllergies: child.otherAllergies,
          medicalConditions: child.medicalConditions,
          medikamente: child.medikamente,
          arzt: child.arzt,
          arztTelefon: child.arztTelefon,
          schwimmer: child.schwimmer,
          schwimmabzeichen: child.schwimmabzeichen,
          bemerkungen: child.bemerkungen,
          medikamenteArray: child.medikamenteArray,
          impfpass: child.impfpass,
          zimmerwunsch: child.zimmerwunsch?.map((zimmerwunsch) => ({
            firstName: zimmerwunsch.firstName,
            lastName: zimmerwunsch.lastName ?? '',
          })),
          datenschutzAkzeptiert: child.datenschutzAkzeptiert,
          agbAkzeptiert: child.agbAkzeptiert,
          bildrechte: child.bildrechte,
        })),
      })

      if (!result.success) {
        toast.error(result.message || 'Die Anmeldung konnte nicht abgeschlossen werden.')
        return
      }

      toast.success(result.message)
      router.push('/sommerfreizeit/account')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kontaktdaten</CardTitle>
          <CardDescription>Bitte überprüfe und vervollständige deine Kontaktdaten.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={(value) => setPhone(value ?? '')}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postleitzahl</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ort</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {children.map((child, index) => (
        <Card key={child.positionId}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>
                {child.firstName} {child.lastName}
              </CardTitle>
              <CardDescription>Position ID: {child.positionId}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Pretix aktualisieren"
              >
                <RefreshCw />
              </Button>
              <Button asChild type="button" variant="outline" size="icon">
                <Link href={pretixModifyHref} target="_blank" rel="noopener">
                  <Pen />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Persönliche Informationen</FieldLegend>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`firstName-${child.positionId}`}>Vorname</FieldLabel>
                    <Input id={`firstName-${child.positionId}`} value={child.firstName} disabled />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`lastName-${child.positionId}`}>Nachname</FieldLabel>
                    <Input id={`lastName-${child.positionId}`} value={child.lastName} disabled />
                  </Field>
                </FieldGroup>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor={`birthDate-${child.positionId}`}>Geburtsdatum</FieldLabel>
                    <Input
                      id={`birthDate-${child.positionId}`}
                      type="date"
                      value={child.dateOfBirth ?? ''}
                      onChange={(event) => updateChild(index, 'dateOfBirth', event.target.value)}
                      required
                      disabled={isPending}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`gender-${child.positionId}`}>Geschlecht</FieldLabel>
                    <Select
                      value={child.gender}
                      onValueChange={(value) =>
                        updateChild(index, 'gender', value as ChildFormState['gender'])
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`gender-${child.positionId}`}
                        aria-label={`Geschlecht fuer Kind ${index + 1}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Bitte wählen">
                          {(value) => genderLabels[value as keyof typeof genderLabels] ?? value}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="male" label="Männlich">
                            Männlich
                          </SelectItem>
                          <SelectItem value="female" label="Weiblich">
                            Weiblich
                          </SelectItem>
                          <SelectItem value="diverse" label="Divers">
                            Divers
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`class-${child.positionId}`}>Klasse</FieldLabel>
                    <Select
                      value={child.class}
                      onValueChange={(value) =>
                        updateChild(index, 'class', value as ChildFormState['class'])
                      }
                      required
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`class-${child.positionId}`}
                        aria-label={`Klasse fuer Kind ${index + 1}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Keine Angabe">
                          {(value) => classLabels[value as keyof typeof classLabels] ?? value}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="3" label="3. Klasse">
                            3. Klasse
                          </SelectItem>
                          <SelectItem value="4" label="4. Klasse">
                            4. Klasse
                          </SelectItem>
                          <SelectItem value="5" label="5. Klasse">
                            5. Klasse
                          </SelectItem>
                          <SelectItem value="6" label="6. Klasse">
                            6. Klasse
                          </SelectItem>
                          <SelectItem value="7" label="7. Klasse">
                            7. Klasse
                          </SelectItem>
                          <SelectItem value="8" label="8. Klasse">
                            8. Klasse
                          </SelectItem>
                          <SelectItem value="9" label="9. Klasse">
                            9. Klasse
                          </SelectItem>
                          <SelectItem value="10" label="10. Klasse">
                            10. Klasse
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSet className="grid grid-cols-1 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Zimmerwunsch</FieldLabel>
                  <ItemGroup>
                    {(child.zimmerwunsch || []).map((roomMate, roomIndex) => (
                      <Item key={roomIndex} size="sm" variant="outline">
                        <ItemContent className="flex gap-1 sm:flex-row">
                          <Input
                            id={`zimmer-first-${child.positionId}-${roomIndex}`}
                            placeholder="Vorname"
                            value={roomMate.firstName || ''}
                            onChange={(e) => {
                              const updated = [...(child.zimmerwunsch || [])]
                              updated[roomIndex] = {
                                ...updated[roomIndex],
                                firstName: e.target.value,
                              }
                              updateChild(index, 'zimmerwunsch', updated)
                            }}
                            disabled={isPending}
                            required
                          />
                          <Input
                            id={`zimmer-last-${child.positionId}-${roomIndex}`}
                            placeholder="Nachname (optional)"
                            value={roomMate.lastName || ''}
                            onChange={(e) => {
                              const updated = [...(child.zimmerwunsch || [])]
                              updated[roomIndex] = {
                                ...updated[roomIndex],
                                lastName: e.target.value,
                              }
                              updateChild(index, 'zimmerwunsch', updated)
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
                              const updated = (child.zimmerwunsch || []).filter(
                                (_, i) => i !== roomIndex,
                              )
                              updateChild(index, 'zimmerwunsch', updated)
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
                          ...(child.zimmerwunsch || []),
                          { firstName: '', lastName: '' },
                        ]
                        updateChild(index, 'zimmerwunsch', updated)
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
              <FieldSet>
                <FieldLegend>Krankenkasse</FieldLegend>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor={`insurance-${child.positionId}`}>
                      Krankenversicherung
                    </FieldLabel>
                    <Input
                      id={`insurance-${child.positionId}`}
                      value={child.krankenversicherung}
                      onChange={(event) =>
                        updateChild(index, 'krankenversicherung', event.target.value)
                      }
                      required
                      disabled={isPending}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`insurance-type-${child.positionId}`}>
                      Versicherungsart
                    </FieldLabel>
                    <Select
                      value={child.krankenversicherungArt}
                      onValueChange={(value) =>
                        updateChild(
                          index,
                          'krankenversicherungArt',
                          value as ChildFormState['krankenversicherungArt'],
                        )
                      }
                      required
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`insurance-type-${child.positionId}`}
                        aria-label={`Versicherungsart fuer Kind ${index + 1}`}
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
                    <FieldLabel htmlFor={`insurance-number-${child.positionId}`}>
                      Versichertennummer
                    </FieldLabel>
                    <Input
                      id={`insurance-number-${child.positionId}`}
                      value={child.krankenversicherungNummer}
                      onChange={(event) =>
                        updateChild(index, 'krankenversicherungNummer', event.target.value)
                      }
                      disabled={isPending}
                    />
                  </Field>
                </FieldGroup>
                <FieldSet>
                  <FieldGroup>
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`krankenkassenkarte-${child.positionId}`}
                        checked={child.krankenkassenKarte ?? false}
                        onCheckedChange={(checked) =>
                          updateChild(index, 'krankenkassenKarte', checked == true)
                        }
                        disabled={isPending}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={`krankenkassenkarte-${child.positionId}`}>
                          Krankenkassenkarte vorhanden
                        </FieldLabel>
                        <FieldDescription>
                          {child.firstName} hat eine Krankenkassenkarte besitzt bringt sie mit.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSet>
                  <FieldGroup>
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`Impfpass-${child.positionId}`}
                        checked={child.impfpass ?? false}
                        onCheckedChange={(checked) =>
                          updateChild(index, 'impfpass', checked == true)
                        }
                        disabled={isPending}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={`Impfpass-${child.positionId}`}>
                          Impfpass vorhanden
                        </FieldLabel>
                        <FieldDescription>
                          {child.firstName} hat einen Impfpass besitzt bringt ihn mit.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Ernährung</FieldLegend>
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`food-allergies-${child.positionId}`}>
                      Lebensmittelallergien
                    </FieldLabel>
                    <Textarea
                      id={`food-allergies-${child.positionId}`}
                      value={child.foodAllergies}
                      onChange={(event) => updateChild(index, 'foodAllergies', event.target.value)}
                      disabled={isPending}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`foodPreferences-${child.positionId}`}>
                      Ernährungspräferenzen
                    </FieldLabel>
                    <RadioGroup
                      id={`foodPreferences-${child.positionId}`}
                      defaultValue=""
                      value={child.foodPreferences}
                      onValueChange={(value) =>
                        updateChild(
                          index,
                          'foodPreferences',
                          value as ChildFormState['foodPreferences'],
                        )
                      }
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value=""
                          id={`none-${child.positionId}`}
                          disabled={isPending}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={`none-${child.positionId}`}>Keine</FieldLabel>
                        </FieldContent>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value="vegetarisch"
                          id={`vegetarisch-${child.positionId}`}
                          disabled={isPending}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={`vegetarisch-${child.positionId}`}>
                            Vegetarisch
                          </FieldLabel>
                        </FieldContent>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value="vegan"
                          id={`vegan-${child.positionId}`}
                          disabled={isPending}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor={`vegan-${child.positionId}`}>Vegan</FieldLabel>
                        </FieldContent>
                      </Field>
                    </RadioGroup>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSet className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`other-allergies-${child.positionId}`}>
                    Sonstige Allergien
                  </FieldLabel>
                  <Textarea
                    id={`other-allergies-${child.positionId}`}
                    value={child.otherAllergies}
                    onChange={(event) => updateChild(index, 'otherAllergies', event.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </FieldSet>
              <FieldSet className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`medical-conditions-${child.positionId}`}>
                    Vorerkrankungen
                  </FieldLabel>
                  <Textarea
                    id={`medical-conditions-${child.positionId}`}
                    value={child.medicalConditions}
                    onChange={(event) =>
                      updateChild(index, 'medicalConditions', event.target.value)
                    }
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`medikamente-${child.positionId}`}>Medikamente</FieldLabel>
                  <Textarea
                    id={`medikamente-${child.positionId}`}
                    value={child.medikamente}
                    onChange={(event) => updateChild(index, 'medikamente', event.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Ärztliche Versorgung</FieldLegend>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`doctor-${child.positionId}`}>Arzt</FieldLabel>
                    <Input
                      id={`doctor-${child.positionId}`}
                      value={child.arzt}
                      onChange={(event) => updateChild(index, 'arzt', event.target.value)}
                      required
                      disabled={isPending}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`doctor-phone-${child.positionId}`}>
                      Arzt-Telefonnummer
                    </FieldLabel>
                    <PhoneInput
                      id={`doctor-phone-${child.positionId}`}
                      value={child.arztTelefon}
                      onChange={(value) => updateChild(index, 'arztTelefon', value ?? '')}
                      required
                      disabled={isPending}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`hausarztmodell-${child.positionId}`}
                      checked={child.hausarztmodell ?? false}
                      onCheckedChange={(checked) =>
                        updateChild(index, 'hausarztmodell', checked === true)
                      }
                      disabled={isPending}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={`hausarztmodell-${child.positionId}`}>
                        Hausarztmodell
                      </FieldLabel>
                      <FieldDescription>
                        Bitte gib an, ob {child.firstName} am{' '}
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
              <FieldSet>
                <FieldLegend>Programm</FieldLegend>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`schwimmer-${child.positionId}`}
                      checked={child.schwimmer ?? false}
                      onCheckedChange={(checked) =>
                        updateChild(index, 'schwimmer', checked === true)
                      }
                      disabled={isPending}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={`schwimmer-${child.positionId}`}>Schwimmer</FieldLabel>
                      <FieldDescription>
                        Bitte gib an, ob {child.firstName} Schwimmer ist.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`schwimmabzeichen-${child.positionId}`}>
                      Schwimmabzeichen
                    </FieldLabel>
                    <Select
                      value={child.schwimmabzeichen}
                      onValueChange={(value) =>
                        updateChild(
                          index,
                          'schwimmabzeichen',
                          value as ChildFormState['schwimmabzeichen'],
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`schwimmabzeichen-${child.positionId}`}
                        aria-label={`Schwimmabzeichen fuer Kind ${index + 1}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Kein Abzeichen">
                          {(value) =>
                            value === null
                              ? 'Kein Abzeichen'
                              : (schwimmabzeichenLabels[
                                  value as keyof typeof schwimmabzeichenLabels
                                ] ?? value)
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={null}>Kein Abzeichen</SelectItem>
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
              <FieldSet>
                <FieldLegend>Sonstiges</FieldLegend>
                <Field>
                  <FieldLabel htmlFor={`bemerkungen-${child.positionId}`}>
                    Weitere Hinweise
                  </FieldLabel>
                  <Textarea
                    id={`bemerkungen-${child.positionId}`}
                    value={child.bemerkungen ?? ''}
                    onChange={(event) => updateChild(index, 'bemerkungen', event.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </FieldSet>
              <FieldSet>
                <Field></Field>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Rechtliches</FieldLegend>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`agb-${child.positionId}`}
                    checked={child.agbAkzeptiert}
                    onCheckedChange={(checked) =>
                      updateChild(index, 'agbAkzeptiert', checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`agb-${child.positionId}`}>AGB akzeptieren</FieldLabel>
                    <FieldDescription>
                      {child.firstName} akzeptiert die{' '}
                      <Link
                        href="/sommerfreizeit/agb"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                      >
                        AGB
                      </Link>
                      .
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`datenschutz-${child.positionId}`}
                    checked={child.datenschutzAkzeptiert}
                    onCheckedChange={(checked) =>
                      updateChild(index, 'datenschutzAkzeptiert', checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`datenschutz-${child.positionId}`}>
                      Datenschutzerklärung akzeptieren
                    </FieldLabel>
                    <FieldDescription>
                      {child.firstName} akzeptiert die{' '}
                      <Link
                        href="/sommerfreizeit/datenschutz"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                      >
                        Datenschutzerklärung
                      </Link>
                      .
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Anmeldung abschliessen</CardTitle>
          <CardDescription>
            Prüfe die Angaben noch einmal und sende die Anmeldung dann ab.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="submit" disabled={isPending || !canSubmit} className="w-full sm:w-auto">
            {isPending ? 'Wird gespeichert...' : 'Anmeldung abschliessen'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
