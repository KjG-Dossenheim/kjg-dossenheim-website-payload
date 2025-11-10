'use client'

import React, { useState } from 'react'
import type { Header } from '@/payload-types'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DynamicIcon } from 'lucide-react/dynamic'
import type { IconName } from 'lucide-react/dynamic'

interface HeaderFormProps {
  initialData: Header
}

export function HeaderForm({ initialData }: HeaderFormProps) {
  const [headerData, setHeaderData] = useState<Header>(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/globals/header', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(headerData),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern')
      }

      const result = await response.json()
      setHeaderData(result.doc)
      setIsEditing(false)
      setSaveMessage({ type: 'success', text: 'Erfolgreich gespeichert!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage({ type: 'error', text: 'Fehler beim Speichern' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setHeaderData(initialData)
    setIsEditing(false)
    setSaveMessage(null)
  }

  // Navigation handlers
  const addNavItem = () => {
    setHeaderData({
      ...headerData,
      navigation: [...(headerData.navigation || []), { title: '', url: '', subNavigation: [] }],
    })
  }

  const removeNavItem = (index: number) => {
    const newNav = [...(headerData.navigation || [])]
    newNav.splice(index, 1)
    setHeaderData({ ...headerData, navigation: newNav })
  }

  const updateNavItem = (index: number, field: string, value: string) => {
    const newNav = [...(headerData.navigation || [])]
    newNav[index] = { ...newNav[index], [field]: value }
    setHeaderData({ ...headerData, navigation: newNav })
  }

  const addSubNavItem = (navIndex: number) => {
    const newNav = [...(headerData.navigation || [])]
    const subNav = newNav[navIndex].subNavigation || []
    newNav[navIndex] = {
      ...newNav[navIndex],
      subNavigation: [...subNav, { label: '', title: '', link: '', url: '' }],
    }
    setHeaderData({ ...headerData, navigation: newNav })
  }

  const removeSubNavItem = (navIndex: number, subIndex: number) => {
    const newNav = [...(headerData.navigation || [])]
    const subNav = [...(newNav[navIndex].subNavigation || [])]
    subNav.splice(subIndex, 1)
    newNav[navIndex] = { ...newNav[navIndex], subNavigation: subNav }
    setHeaderData({ ...headerData, navigation: newNav })
  }

  const updateSubNavItem = (navIndex: number, subIndex: number, field: string, value: string) => {
    const newNav = [...(headerData.navigation || [])]
    const subNav = [...(newNav[navIndex].subNavigation || [])]
    subNav[subIndex] = { ...subNav[subIndex], [field]: value }
    newNav[navIndex] = { ...newNav[navIndex], subNavigation: subNav }
    setHeaderData({ ...headerData, navigation: newNav })
  }

  // Aktionen handlers
  const addAktionItem = () => {
    setHeaderData({
      ...headerData,
      aktionen: [...(headerData.aktionen || []), { icon: '', title: '', url: '' }],
    })
  }

  const removeAktionItem = (index: number) => {
    const newAktionen = [...(headerData.aktionen || [])]
    newAktionen.splice(index, 1)
    setHeaderData({ ...headerData, aktionen: newAktionen })
  }

  const updateAktionItem = (index: number, field: string, value: string) => {
    const newAktionen = [...(headerData.aktionen || [])]
    newAktionen[index] = { ...newAktionen[index], [field]: value }
    setHeaderData({ ...headerData, aktionen: newAktionen })
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Header</h2>
          <Button onClick={() => setIsEditing(true)}>Bearbeiten</Button>
        </div>

        {/* Read-only view */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            {headerData.navigation && headerData.navigation.length > 0 ? (
              <ul className="space-y-4">
                {headerData.navigation.map((item, index) => (
                  <li key={index} className="border-muted border-l-4 pl-4">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-muted-foreground">{item.url}</div>
                    {item.subNavigation && item.subNavigation.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {item.subNavigation.map((subItem, subIndex) => (
                          <li key={subIndex} className="">
                            {subItem.label} → {subItem.url}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Keine Navigation festgelegt</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            {headerData.aktionen && headerData.aktionen.length > 0 ? (
              <ul className="space-y-3">
                {headerData.aktionen.map((item, index) => (
                  <li key={index} className="border-muted border-l-4 pl-4">
                    <div className="font-medium">
                      {item.icon && <DynamicIcon name={item.icon as IconName} className="size-4" />}
                      {item.title}
                    </div>
                    <div className="text-muted-foreground">{item.url}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Keine Aktionen festgelegt</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Header bearbeiten</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" /> Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <Alert variant={saveMessage.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{saveMessage.text}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Navigation</CardTitle>
            <Button onClick={addNavItem} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {headerData.navigation?.map((navItem, navIndex) => (
            <Card key={navIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Navigation Item {navIndex + 1}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => removeNavItem(navIndex)}>
                    <Trash2 className="mr-2 h-3 w-3" /> Entfernen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`nav-title-${navIndex}`}>Title *</Label>
                  <Input
                    id={`nav-title-${navIndex}`}
                    type="text"
                    value={navItem.title || ''}
                    onChange={(e) => updateNavItem(navIndex, 'title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nav-url-${navIndex}`}>URL *</Label>
                  <Input
                    id={`nav-url-${navIndex}`}
                    type="text"
                    value={navItem.url || ''}
                    onChange={(e) => updateNavItem(navIndex, 'url', e.target.value)}
                  />
                </div>

                {/* Sub-Navigation */}
                <div className="border-muted ml-4 space-y-3 border-l-2 pl-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Sub-Navigation</Label>
                    <Button variant="outline" size="sm" onClick={() => addSubNavItem(navIndex)}>
                      <Plus className="mr-2 h-3 w-3" /> Hinzufügen
                    </Button>
                  </div>

                  {navItem.subNavigation?.map((subItem, subIndex) => (
                    <Card key={subIndex} className="bg-muted/50">
                      <CardContent className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Sub-Item {subIndex + 1}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSubNavItem(navIndex, subIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subnav-label-${navIndex}-${subIndex}`}>Label *</Label>
                          <Input
                            id={`subnav-label-${navIndex}-${subIndex}`}
                            type="text"
                            value={subItem.label || ''}
                            onChange={(e) =>
                              updateSubNavItem(navIndex, subIndex, 'label', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subnav-title-${navIndex}-${subIndex}`}>Title *</Label>
                          <Input
                            id={`subnav-title-${navIndex}-${subIndex}`}
                            type="text"
                            value={subItem.title || ''}
                            onChange={(e) =>
                              updateSubNavItem(navIndex, subIndex, 'title', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subnav-link-${navIndex}-${subIndex}`}>Link *</Label>
                          <Input
                            id={`subnav-link-${navIndex}-${subIndex}`}
                            type="text"
                            value={subItem.link || ''}
                            onChange={(e) =>
                              updateSubNavItem(navIndex, subIndex, 'link', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`subnav-url-${navIndex}-${subIndex}`} className="text-xs">
                            URL *
                          </Label>
                          <Input
                            id={`subnav-url-${navIndex}-${subIndex}`}
                            type="text"
                            value={subItem.url || ''}
                            onChange={(e) =>
                              updateSubNavItem(navIndex, subIndex, 'url', e.target.value)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Aktionen Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aktionen</CardTitle>
            <Button onClick={addAktionItem} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {headerData.aktionen?.map((aktion, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Aktion {index + 1}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => removeAktionItem(index)}>
                    <Trash2 className="mr-2 size-3" /> Entfernen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`aktion-icon-${index}`}>Icon (Lucide Icon Name) *</Label>
                  <Input
                    id={`aktion-icon-${index}`}
                    type="text"
                    value={aktion.icon || ''}
                    onChange={(e) => updateAktionItem(index, 'icon', e.target.value)}
                    placeholder="z.B. Calendar"
                  />
                  <p className="text-muted-foreground text-xs">
                    Icon-Name von https://lucide.dev/icons
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`aktion-title-${index}`}>Title *</Label>
                  <Input
                    id={`aktion-title-${index}`}
                    type="text"
                    value={aktion.title || ''}
                    onChange={(e) => updateAktionItem(index, 'title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`aktion-url-${index}`}>URL *</Label>
                  <Input
                    id={`aktion-url-${index}`}
                    type="text"
                    value={aktion.url || ''}
                    onChange={(e) => updateAktionItem(index, 'url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
