'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { completeOrderCheckAction } from '../action'

type PositionView = {
  positionId: string
  attendeeName: string
}

type CheckFormProps = {
  accountDefaults: {
    phone: string
    address: string
    postalCode: string
    city: string
  }
  orderCode: string
  positions: PositionView[]
}

type ChildFormState = {
  positionId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'diverse'
  class: '' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  krankenversicherung: string
  krankenversicherungArt: 'gesetzlich' | 'privat'
  krankenversicherungNummer: string
  foodAllergies: string
  otherAllergies: string
  medicalConditions: string
  medikamente: string
  arzt: string
  arztTelefon: string
  versicherungsNummer: string
  versicherungsAnbieter: string
  schwimmer: boolean
  bemerkungen: string
}

function splitName(name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
    }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

function buildInitialChild(position: PositionView): ChildFormState {
  const name = splitName(position.attendeeName)

  return {
    positionId: position.positionId,
    firstName: name.firstName,
    lastName: name.lastName,
    dateOfBirth: '',
    gender: 'male',
    class: '',
    krankenversicherung: '',
    krankenversicherungArt: 'gesetzlich',
    krankenversicherungNummer: '',
    foodAllergies: '',
    otherAllergies: '',
    medicalConditions: '',
    medikamente: '',
    arzt: '',
    arztTelefon: '',
    versicherungsNummer: '',
    versicherungsAnbieter: '',
    schwimmer: false,
    bemerkungen: '',
  }
}

export function CheckForm({ accountDefaults, orderCode, positions }: CheckFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone, setPhone] = useState(accountDefaults.phone)
  const [address, setAddress] = useState(accountDefaults.address)
  const [postalCode, setPostalCode] = useState(accountDefaults.postalCode)
  const [city, setCity] = useState(accountDefaults.city)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [children, setChildren] = useState<ChildFormState[]>(() =>
    positions.map((position) => buildInitialChild(position)),
  )

  const canSubmit = useMemo(() => children.length > 0, [children.length])

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    startTransition(async () => {
      const result = await completeOrderCheckAction({
        orderCode,
        phone,
        address,
        postalCode,
        city,
        children: children.map((child) => ({
          ...child,
          class: child.class || undefined,
        })),
      })

      if (!result.success) {
        setError(result.message || 'Die Anmeldung konnte nicht abgeschlossen werden.')
        return
      }

      setSuccessMessage(result.message)
      router.push('/sommerfreizeit/account')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kontaktdaten</CardTitle>
          <CardDescription>
            Diese Daten werden in deinem Sommerfreizeit-Konto gespeichert.
          </CardDescription>
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
              onChange={(event) => setAddress(event.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postleitzahl</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ort</Label>
            <Input
              id="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {children.map((child, index) => (
        <Card key={child.positionId}>
          <CardHeader>
            <CardTitle>Kind {index + 1}</CardTitle>
            <CardDescription>Pretix Position: {child.positionId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vorname</Label>
                <Input value={child.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nachname</Label>
                <Input value={child.lastName} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Geburtsdatum</Label>
                <Input
                  type="date"
                  value={child.dateOfBirth}
                  onChange={(event) => updateChild(index, 'dateOfBirth', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`gender-${child.positionId}`}>Geschlecht</Label>
                <select
                  id={`gender-${child.positionId}`}
                  aria-label={`Geschlecht fuer Kind ${index + 1}`}
                  className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                  value={child.gender}
                  onChange={(event) =>
                    updateChild(index, 'gender', event.target.value as ChildFormState['gender'])
                  }
                  disabled={isPending}
                >
                  <option value="">Bitte wählen</option>
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                  <option value="diverse">Divers</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`class-${child.positionId}`}>Klasse</Label>
                <select
                  id={`class-${child.positionId}`}
                  aria-label={`Klasse fuer Kind ${index + 1}`}
                  className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                  value={child.class}
                  onChange={(event) =>
                    updateChild(index, 'class', event.target.value as ChildFormState['class'])
                  }
                  disabled={isPending}
                >
                  <option value="">Keine Angabe</option>
                  <option value="3">3. Klasse</option>
                  <option value="4">4. Klasse</option>
                  <option value="5">5. Klasse</option>
                  <option value="6">6. Klasse</option>
                  <option value="7">7. Klasse</option>
                  <option value="8">8. Klasse</option>
                  <option value="9">9. Klasse</option>
                  <option value="10">10. Klasse</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Krankenversicherung</Label>
                <Input
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
                <select
                  id={`insurance-type-${child.positionId}`}
                  aria-label={`Versicherungsart fuer Kind ${index + 1}`}
                  className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                  value={child.krankenversicherungArt}
                  onChange={(event) =>
                    updateChild(
                      index,
                      'krankenversicherungArt',
                      event.target.value as ChildFormState['krankenversicherungArt'],
                    )
                  }
                  disabled={isPending}
                >
                  <option value="gesetzlich">Gesetzlich</option>
                  <option value="privat">Privat</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Versichertennummer</Label>
                <Input
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
                <Label>Lebensmittelallergien</Label>
                <Input
                  value={child.foodAllergies}
                  onChange={(event) => updateChild(index, 'foodAllergies', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Sonstige Allergien</Label>
                <Input
                  value={child.otherAllergies}
                  onChange={(event) => updateChild(index, 'otherAllergies', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vorerkrankungen</Label>
                <Input
                  value={child.medicalConditions}
                  onChange={(event) => updateChild(index, 'medicalConditions', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Medikamente</Label>
                <Input
                  value={child.medikamente}
                  onChange={(event) => updateChild(index, 'medikamente', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Arzt</Label>
                <Input
                  value={child.arzt}
                  onChange={(event) => updateChild(index, 'arzt', event.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Arzt-Telefon</Label>
                <PhoneInput
                  value={child.arztTelefon}
                  onChange={(value) => updateChild(index, 'arztTelefon', value ?? '')}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Versicherungsnummer</Label>
                <Input
                  value={child.versicherungsNummer}
                  onChange={(event) =>
                    updateChild(index, 'versicherungsNummer', event.target.value)
                  }
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Versicherungsanbieter</Label>
                <Input
                  value={child.versicherungsAnbieter}
                  onChange={(event) =>
                    updateChild(index, 'versicherungsAnbieter', event.target.value)
                  }
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id={`schwimmer-${child.positionId}`}
                aria-label={`Schwimmer-Status fuer Kind ${index + 1}`}
                type="checkbox"
                checked={child.schwimmer}
                onChange={(event) => updateChild(index, 'schwimmer', event.target.checked)}
                disabled={isPending}
              />
              <Label htmlFor={`schwimmer-${child.positionId}`}>Kind ist Schwimmer</Label>
            </div>

            <div className="space-y-2">
              <Label>Weitere Hinweise</Label>
              <Input
                value={child.bemerkungen}
                onChange={(event) => updateChild(index, 'bemerkungen', event.target.value)}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isPending || !canSubmit} className="w-full sm:w-auto">
        {isPending ? 'Wird gespeichert...' : 'Anmeldung abschliessen'}
      </Button>
    </form>
  )
}
