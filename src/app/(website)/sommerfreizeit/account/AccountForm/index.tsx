'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { deleteChildAction, updateAccountAction } from '../actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sommerfreizeitAuthClient } from '@/lib/auth/client'

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
  dateOfBirth: string | null
  gender: 'male' | 'female' | 'diverse' | ''
  class?: string | null
  _status?: string
  createdAt: string
}

const getGenderLabel = (gender: ChildListItem['gender']) => {
  if (!gender) {
    return 'Keine Angabe'
  }

  if (gender === 'male') {
    return 'Maennlich'
  }

  if (gender === 'female') {
    return 'Weiblich'
  }

  return 'Divers'
}

function formatOptionalDate(value: string | null) {
  if (!value) {
    return 'Keine Angabe'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Keine Angabe'
  }

  return new Intl.DateTimeFormat('de-DE').format(date)
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [children, setChildren] = useState<ChildListItem[]>(initialChildren)
  const [isDeletingChildId, setIsDeletingChildId] = useState<string | null>(null)
  const [accountStatus, setAccountStatus] = useState<{ success: boolean; message: string } | null>(
    null,
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAccountStatus(null)
    setIsSaving(true)

    const result = await updateAccountAction({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
    })

    setAccountStatus(result)

    if (result.success) {
      router.refresh()
    }

    setIsSaving(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await sommerfreizeitAuthClient.signOut()
      router.push('/sommerfreizeit/login')
      router.refresh()
    } catch {
      setAccountStatus({
        success: false,
        message: 'Abmeldung fehlgeschlagen. Bitte versuche es erneut.',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteChild = async (childId: string) => {
    setAccountStatus(null)
    setIsDeletingChildId(childId)

    const result = await deleteChildAction(childId)

    if (result.success) {
      setChildren((prev) => prev.filter((child) => child.id !== childId))
      setAccountStatus(result)
      router.refresh()
    } else {
      setAccountStatus(result)
    }

    setIsDeletingChildId(null)
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mein Konto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
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

            {accountStatus ? (
              <Alert variant={accountStatus.success ? 'default' : 'destructive'}>
                <AlertDescription>{accountStatus.message}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
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
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sommerfreizeit/account/sommerfreizeitChild/${child.id}`}>
                          Bearbeiten
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/sommerfreizeit/account/kinder/create">Neues Kind anlegen</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
