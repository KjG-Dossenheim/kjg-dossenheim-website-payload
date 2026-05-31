'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { updateAccountAction } from '../actions'
import { Badge } from '@/components/ui/badge'
import { buttonVariants, Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'

type AccountFormData = {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  postalCode: string
  city: string
}

type AccountFormProps = {
  initialData: {
    email: string
    firstName: string
    lastName: string
    phone: string
    address: string
    postalCode: string
    city: string
  }
  initialChildren: ChildListItem[]
}

type ChildListItem = {
  id: string
  firstName: string
  lastName: string
  class?: string | null
  _status?: string
  createdAt: string
}

export const AccountForm: React.FC<AccountFormProps> = ({ initialData, initialChildren }) => {
  const router = useRouter()

  const [formData, setFormData] = useState<AccountFormData>({
    email: initialData.email,
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    phone: initialData.phone,
    address: initialData.address,
    postalCode: initialData.postalCode,
    city: initialData.city,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [children] = useState<ChildListItem[]>(initialChildren)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // PhoneInput supplies the new value (E164Number/string) instead of an event
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const result = await updateAccountAction({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
      })

      if (result.success) {
        toast.success(result.message, { toasterId: 'form' })
        router.refresh()
      } else {
        toast.error(result.message, { toasterId: 'form' })
      }
    } catch {
      toast.error('Beim Speichern ist ein unerwarteter Fehler aufgetreten.', {
        toasterId: 'form',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mein Konto</CardTitle>
          <CardAction>
            <Link
              href="/sommerfreizeit/logout"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Logout
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id="account-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" value={formData.email} disabled />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Musterstrasse 12"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postleitzahl</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="69221"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Dossenheim"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="account-form" disabled={isSaving}>
            {isSaving ? 'Speichert...' : 'Speichern'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Kinder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {children.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Du hast bisher noch keine Kinder in deinem Konto gespeichert.
            </p>
          ) : (
            <div className="space-y-3">
              {children.map((child) => {
                const isDraft = child._status === 'draft'

                return (
                  <Card key={child.id}>
                    <CardHeader>
                      <CardTitle>
                        {child.firstName} {child.lastName}{' '}
                        {isDraft ? <Badge variant="secondary">Entwurf</Badge> : null}
                      </CardTitle>
                      <CardDescription>
                        Angelegt am{' '}
                        {new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(
                          new Date(child.createdAt),
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
