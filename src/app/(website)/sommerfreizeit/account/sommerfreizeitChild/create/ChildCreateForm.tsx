'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createChildAction } from '../../actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { SommerfreizeitChild } from '@/payload-types'

type ChildFormData = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: SommerfreizeitChild['gender']
}

const initialFormState: ChildFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
}

export function ChildCreateForm() {
  const router = useRouter()
  const [isCreatingChild, setIsCreatingChild] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState<ChildFormData>(initialFormState)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsCreatingChild(true)

    const result = await createChildAction({
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
    })
    setStatus({ success: result.success, message: result.message })

    if (result.success) {
      router.push('/sommerfreizeit/account')
      router.refresh()
      return
    }

    setIsCreatingChild(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neues Kind anlegen</CardTitle>
        <CardDescription>
          Hinterlege hier die Daten eines Kindes fuer spaetere Sommerfreizeit-Anmeldungen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isCreatingChild}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isCreatingChild}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                disabled={isCreatingChild}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Geschlecht</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'diverse' | null) =>
                  value && setFormData((prev) => ({ ...prev, gender: value }))
                }
                disabled={isCreatingChild}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Bitte auswaehlen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maennlich</SelectItem>
                  <SelectItem value="female">Weiblich</SelectItem>
                  <SelectItem value="diverse">Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status ? (
            <Alert variant={status.success ? 'default' : 'destructive'}>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isCreatingChild}>
              {isCreatingChild ? 'Speichert...' : 'Kind speichern'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
