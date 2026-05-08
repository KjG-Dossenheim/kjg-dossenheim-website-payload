'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { updateAccountAction } from '../actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

  return (
    <div className="mx-auto w-full space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Mein Konto</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/sommerfreizeit/logout">Logout</Link>
          </Button>
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
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
        {/*  <CardFooter>
          <Button asChild>
            <Link href="/sommerfreizeit/account/sommerfreizeitChild/create">
              Neues Kind anlegen
            </Link>
          </Button>
        </CardFooter> */}
      </Card>
    </div>
  )
}
