'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import type { SommerfreizeitAnmeldung, SommerfreizeitChild } from '@/payload-types'

import { completeOrderCheckAction, getOrderFlowView } from '../action'
import Link from 'next/link'
import { Pen, RefreshCw } from 'lucide-react'

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
}

type ChildFormState = {
  positionId: string
  pretixOrderID: string
  pretixSecret: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: '' | SommerfreizeitChild['gender']
  class: '' | SommerfreizeitAnmeldung['class']
  krankenversicherung: string
  krankenversicherungArt: '' | SommerfreizeitAnmeldung['krankenversicherungArt']
  krankenversicherungNummer: string
  foodAllergies: string
  otherAllergies: string
  medicalConditions: string
  medikamente: string
  arzt: string
  arztTelefon: string
  schwimmer: boolean
  bemerkungen: string
}

function buildInitialChild(position: PositionView): ChildFormState {
  return {
    positionId: position.positionId,
    pretixOrderID: position.pretixOrderID,
    pretixSecret: position.pretixSecret,
    firstName: position.firstName,
    lastName: position.lastName,
    dateOfBirth: '',
    gender: '',
    class: '',
    krankenversicherung: '',
    krankenversicherungArt: '',
    krankenversicherungNummer: '',
    foodAllergies: '',
    otherAllergies: '',
    medicalConditions: '',
    medikamente: '',
    arzt: '',
    arztTelefon: '',
    schwimmer: false,
    bemerkungen: '',
  }
}

export function CheckForm({
  accountDefaults,
  orderCode,
  pretixOrderID,
  pretixSecret,
  pretixEvent,
  positions,
}: CheckFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone] = useState(accountDefaults.phone)
  const [address] = useState(accountDefaults.address)
  const [postalCode] = useState(accountDefaults.postalCode)
  const [city] = useState(accountDefaults.city)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const [children, setChildren] = useState<ChildFormState[]>(() =>
    positions.map((position) => buildInitialChild(position)),
  )

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
          gender: child.gender as 'male' | 'female' | 'diverse',
          class: child.class || undefined,
          krankenversicherung: child.krankenversicherung,
          krankenversicherungArt: child.krankenversicherungArt as 'gesetzlich' | 'privat',
          krankenversicherungNummer: child.krankenversicherungNummer,
          foodAllergies: child.foodAllergies,
          otherAllergies: child.otherAllergies,
          medicalConditions: child.medicalConditions,
          medikamente: child.medikamente,
          arzt: child.arzt,
          arztTelefon: child.arztTelefon,
          schwimmer: child.schwimmer,
          bemerkungen: child.bemerkungen,
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
          <CardDescription>
            Diese Daten wurden aus deiner Pretix-Bestellung übernommen und in deinem
            Sommerfreizeit-Konto gespeichert.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <PhoneInput id="phone" value={phone} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={address} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postleitzahl</Label>
            <Input id="postalCode" value={postalCode} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ort</Label>
            <Input id="city" value={city} disabled />
          </div>
        </CardContent>
      </Card>

      {children.map((child, index) => (
        <Card key={child.positionId}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Kind {index + 1}</CardTitle>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`firstName-${child.positionId}`}>Vorname</Label>
                <Input id={`firstName-${child.positionId}`} value={child.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lastName-${child.positionId}`}>Nachname</Label>
                <Input id={`lastName-${child.positionId}`} value={child.lastName} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`birthDate-${child.positionId}`}>Geburtsdatum</Label>
                <Input
                  id={`birthDate-${child.positionId}`}
                  type="date"
                  value={child.dateOfBirth ?? ''}
                  onChange={(event) => updateChild(index, 'dateOfBirth', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`gender-${child.positionId}`}>Geschlecht</Label>
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
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Männlich</SelectItem>
                      <SelectItem value="female">Weiblich</SelectItem>
                      <SelectItem value="diverse">Divers</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`class-${child.positionId}`}>Klasse</Label>
                <Select
                  value={child.class}
                  onValueChange={(value) =>
                    updateChild(index, 'class', value as ChildFormState['class'])
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`class-${child.positionId}`}
                    aria-label={`Klasse fuer Kind ${index + 1}`}
                    className="w-full"
                  >
                    <SelectValue placeholder="Keine Angabe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="3">3. Klasse</SelectItem>
                      <SelectItem value="4">4. Klasse</SelectItem>
                      <SelectItem value="5">5. Klasse</SelectItem>
                      <SelectItem value="6">6. Klasse</SelectItem>
                      <SelectItem value="7">7. Klasse</SelectItem>
                      <SelectItem value="8">8. Klasse</SelectItem>
                      <SelectItem value="9">9. Klasse</SelectItem>
                      <SelectItem value="10">10. Klasse</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`insurance-${child.positionId}`}>Krankenversicherung</Label>
                <Input
                  id={`insurance-${child.positionId}`}
                  value={child.krankenversicherung}
                  onChange={(event) =>
                    updateChild(index, 'krankenversicherung', event.target.value)
                  }
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-type-${child.positionId}`}>Versicherungsart</Label>
                <Select
                  value={child.krankenversicherungArt}
                  onValueChange={(value) =>
                    updateChild(
                      index,
                      'krankenversicherungArt',
                      value as ChildFormState['krankenversicherungArt'],
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`insurance-type-${child.positionId}`}
                    aria-label={`Versicherungsart fuer Kind ${index + 1}`}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="gesetzlich">Gesetzlich</SelectItem>
                      <SelectItem value="privat">Privat</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-number-${child.positionId}`}>Versichertennummer</Label>
                <Input
                  id={`insurance-number-${child.positionId}`}
                  value={child.krankenversicherungNummer}
                  onChange={(event) =>
                    updateChild(index, 'krankenversicherungNummer', event.target.value)
                  }
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`food-allergies-${child.positionId}`}>Lebensmittelallergien</Label>
                <Textarea
                  id={`food-allergies-${child.positionId}`}
                  value={child.foodAllergies}
                  onChange={(event) => updateChild(index, 'foodAllergies', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`other-allergies-${child.positionId}`}>Sonstige Allergien</Label>
                <Textarea
                  id={`other-allergies-${child.positionId}`}
                  value={child.otherAllergies}
                  onChange={(event) => updateChild(index, 'otherAllergies', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`medical-conditions-${child.positionId}`}>Vorerkrankungen</Label>
                <Textarea
                  id={`medical-conditions-${child.positionId}`}
                  value={child.medicalConditions}
                  onChange={(event) => updateChild(index, 'medicalConditions', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`medikamente-${child.positionId}`}>Medikamente</Label>
                <Textarea
                  id={`medikamente-${child.positionId}`}
                  value={child.medikamente}
                  onChange={(event) => updateChild(index, 'medikamente', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`doctor-${child.positionId}`}>Arzt</Label>
                <Input
                  id={`doctor-${child.positionId}`}
                  value={child.arzt}
                  onChange={(event) => updateChild(index, 'arzt', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`doctor-phone-${child.positionId}`}>Arzt-Telefonnummer</Label>
                <PhoneInput
                  id={`doctor-phone-${child.positionId}`}
                  value={child.arztTelefon}
                  onChange={(value) => updateChild(index, 'arztTelefon', value ?? '')}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id={`schwimmer-${child.positionId}`}
                checked={child.schwimmer ?? false}
                onCheckedChange={(checked) => updateChild(index, 'schwimmer', checked === true)}
                disabled={isPending}
              />
              <Label htmlFor={`schwimmer-${child.positionId}`}>Kind ist Schwimmer</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`bemerkungen-${child.positionId}`}>Weitere Hinweise</Label>
              <Textarea
                id={`bemerkungen-${child.positionId}`}
                value={child.bemerkungen ?? ''}
                onChange={(event) => updateChild(index, 'bemerkungen', event.target.value)}
                disabled={isPending}
              />
            </div>
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
        <CardContent className="space-y-4" />
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Der Abschluss wird erst wirksam, wenn alle Pflichtangaben vollständig sind.
          </p>
          <Button type="submit" disabled={isPending || !canSubmit} className="w-full sm:w-auto">
            {isPending ? 'Wird gespeichert...' : 'Anmeldung abschliessen'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
