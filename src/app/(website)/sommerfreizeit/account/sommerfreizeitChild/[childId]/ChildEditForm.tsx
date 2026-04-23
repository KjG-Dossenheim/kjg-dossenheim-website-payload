'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { type UpdateChildInput, updateChildAction } from '../../actions'
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

type ChildEditFormData = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'diverse' | ''
}

type ChildEditFormProps = {
  childId: string
  initialData: ChildEditFormData
}

export function ChildEditForm({ childId, initialData }: ChildEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ChildEditFormData>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

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
    setIsSaving(true)

    const childInput: UpdateChildInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
    }

    if (formData.gender) {
      childInput.gender = formData.gender
    }

    const result = await updateChildAction(childId, childInput)
    setStatus(result)

    if (result.success) {
      router.push('/sommerfreizeit/account')
      router.refresh()
      return
    }

    setIsSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kind bearbeiten</CardTitle>
        <CardDescription>
          Passe hier die Daten deines Kindes fuer kuenftige Sommerfreizeit-Anmeldungen an.
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
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth ?? ''}
                onChange={handleInputChange}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Geschlecht</Label>
              <Select
                value={formData.gender || '__none__'}
                onValueChange={(value: 'male' | 'female' | 'diverse' | '__none__') =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: value === '__none__' ? '' : value,
                  }))
                }
                disabled={isSaving}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Bitte auswaehlen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Keine Angabe</SelectItem>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Speichert...' : 'Aenderungen speichern'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
