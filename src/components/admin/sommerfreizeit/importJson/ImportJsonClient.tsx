'use client'

import { useState, useTransition, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, FileJson, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { importCheckFormJson, type ImportResult } from './actions'

type PreviewChild = {
  name: string
  positionId: string
  exists: boolean
  fieldCount: number
  mergedCount: number
}

type Preview = {
  orderCode: string
  contact: { phone: string; address: string; postalCode: string; city: string } | null
  children: PreviewChild[]
  totalFields: number
  totalMerged: number
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsText(file)
  })
}

function buildPreview(raw: unknown): Preview {
  const data = raw as Record<string, unknown>
  const children = (Array.isArray(data.children) ? data.children : []) as Record<string, unknown>[]

  const childPreviews: PreviewChild[] = children.map((child) => {
    const fieldCount = Object.keys(child).filter(
      (k) =>
        !['positionId', 'orderPosition', 'firstName', 'lastName', 'dateOfBirth', 'gender'].includes(k) &&
        child[k] !== null &&
        child[k] !== undefined &&
        child[k] !== '' &&
        child[k] !== false,
    ).length

    return {
      name: `${child.firstName ?? '?'} ${child.lastName ?? '?'}`,
      positionId: (child.positionId as string) ?? '?',
      exists: false, // cannot know without server round-trip
      fieldCount,
      mergedCount: fieldCount,
    }
  })

  return {
    orderCode: (data.orderCode as string) ?? '?',
    contact: data.contact
      ? {
          phone: (data.contact as Record<string, string>).phone ?? '-',
          address: (data.contact as Record<string, string>).address ?? '-',
          postalCode: (data.contact as Record<string, string>).postalCode ?? '-',
          city: (data.contact as Record<string, string>).city ?? '-',
        }
      : null,
    children: childPreviews,
    totalFields: childPreviews.reduce((sum, c) => sum + c.fieldCount, 0),
    totalMerged: childPreviews.reduce((sum, c) => sum + c.mergedCount, 0),
  }
}

export function ImportJsonClient() {
  const [isPending, startTransition] = useTransition()
  const [jsonContent, setJsonContent] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setResult(null)
    setParseError(null)
    setPreview(null)

    if (!file.name.endsWith('.json')) {
      setParseError('Bitte wähle eine .json-Datei aus.')
      return
    }

    try {
      const text = await readFileAsText(file)
      const parsed = JSON.parse(text)
      setJsonContent(text)
      setPreview(buildPreview(parsed))
    } catch {
      setParseError('Die Datei enthält kein gültiges JSON.')
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleImport = useCallback(() => {
    if (!jsonContent) return

    startTransition(async () => {
      const res = await importCheckFormJson(jsonContent)
      setResult(res)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }, [jsonContent])

  const handleReset = useCallback(() => {
    setJsonContent(null)
    setPreview(null)
    setParseError(null)
    setResult(null)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CheckForm JSON importieren</CardTitle>
          <CardDescription>
            Lade eine JSON-Datei hoch, die über den &quot;Exportieren&quot;-Button im
            Anmeldeformular exportiert wurde. Die Daten werden in bestehende Anmeldungen eingefügt
            oder neue Einträge erstellt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview && !parseError && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed border-(--theme-elevation-250) p-12 transition-colors hover:border-(--theme-elevation-400)"
              onClick={() => document.getElementById('json-file-input')?.click()}
            >
              <Upload className="size-10 text-(--theme-text-400)" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  JSON-Datei hier ablegen oder klicken zum Auswählen
                </p>
                <p className="mt-1 text-xs text-(--theme-text-400)">Nur .json-Dateien</p>
              </div>
              <input
                id="json-file-input"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {parseError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="size-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Fehler beim Lesen der Datei
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">{parseError}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="ml-auto shrink-0">
                Neu laden
              </Button>
            </div>
          )}

          {preview && !result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <FileJson className="size-5 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Datei erfolgreich geparst
                  </p>
                  <p className="truncate text-sm text-green-600 dark:text-green-300">
                    Bestellung: {preview.orderCode} · {preview.children.length} Kind
                    {preview.children.length !== 1 ? 'er' : ''} · {preview.totalFields} Felder
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0">
                  Andere Datei
                </Button>
              </div>

              {/* Contact preview */}
              {preview.contact && (
                <div className="rounded-lg border border-(--theme-elevation-150) p-4">
                  <h3 className="mb-2 text-sm font-semibold">Kontaktdaten</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-(--theme-text-400)">Telefon:</span>
                    <span>{preview.contact.phone}</span>
                    <span className="text-(--theme-text-400)">Adresse:</span>
                    <span>{preview.contact.address}</span>
                    <span className="text-(--theme-text-400)">PLZ:</span>
                    <span>{preview.contact.postalCode}</span>
                    <span className="text-(--theme-text-400)">Ort:</span>
                    <span>{preview.contact.city}</span>
                  </div>
                </div>
              )}

              {/* Children table */}
              <div className="overflow-x-auto rounded-lg border border-(--theme-elevation-150)">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--theme-elevation-150) bg-(--theme-elevation-50)">
                      <th className="px-4 py-2 text-left font-medium">Kind</th>
                      <th className="px-4 py-2 text-left font-medium">Position ID</th>
                      <th className="px-4 py-2 text-right font-medium">Felder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.children.map((child, i) => (
                      <tr
                        key={child.positionId}
                        className={
                          i < preview.children.length - 1
                            ? 'border-b border-(--theme-elevation-100)'
                            : ''
                        }
                      >
                        <td className="px-4 py-2">{child.name}</td>
                        <td className="px-4 py-2 font-mono text-xs text-(--theme-text-400)">
                          {child.positionId}
                        </td>
                        <td className="px-4 py-2 text-right">{child.fieldCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  result.success
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="size-5 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="size-5 shrink-0 text-yellow-600" />
                )}
                <p className="text-sm font-medium">{result.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-(--theme-elevation-150) p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.childrenCreated}</div>
                  <div className="text-xs text-(--theme-text-400)">Kinder erstellt</div>
                </div>
                <div className="rounded-lg border border-(--theme-elevation-150) p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.childrenUpdated}</div>
                  <div className="text-xs text-(--theme-text-400)">Kinder aktualisiert</div>
                </div>
                <div className="rounded-lg border border-(--theme-elevation-150) p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.anmeldungenCreated}
                  </div>
                  <div className="text-xs text-(--theme-text-400)">Anmeldungen erstellt</div>
                </div>
                <div className="rounded-lg border border-(--theme-elevation-150) p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.anmeldungenUpdated}
                  </div>
                  <div className="text-xs text-(--theme-text-400)">Anmeldungen aktualisiert</div>
                </div>
              </div>

              {result.contactUpdated && (
                <p className="text-sm text-(--theme-text-400)">
                  ✓ Kontaktdaten des Benutzerkontos wurden aktualisiert.
                </p>
              )}

              {result.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                  <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
                    Fehler ({result.errors.length})
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-300">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="outline" onClick={handleReset}>
                Weitere Datei importieren
              </Button>
            </div>
          )}
        </CardContent>
        {preview && !result && (
          <CardFooter>
            <Button onClick={handleImport} disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Importiere...
                </>
              ) : (
                'Jetzt importieren'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
