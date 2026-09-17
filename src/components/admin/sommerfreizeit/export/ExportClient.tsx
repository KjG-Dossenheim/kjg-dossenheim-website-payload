'use client'

import React, { useState } from 'react'
import { toast } from '@payloadcms/ui'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchExportCsv } from './actions'
import type { ExportEventOption } from './types'

type ExportClientProps = {
  events: ExportEventOption[]
  defaultEventId: string | null
}

export function ExportClient({ events, defaultEventId }: ExportClientProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultEventId ?? events[0]?.id ?? '',
  )
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!selectedEventId) {
      toast.error('Bitte eine Freizeit auswählen.')
      return
    }

    setIsExporting(true)

    try {
      const result = await fetchExportCsv(selectedEventId)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (result.rowCount === 0) {
        toast.warning('Keine Daten zum Exportieren vorhanden.')
        return
      }

      const blob = new Blob(['\uFEFF' + result.csv], {
        type: 'text/csv;charset=utf-8;',
      })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')

      link.href = blobUrl
      link.download = `sommerfreizeit-export_${selectedEventId}_${timestamp}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)

      toast.success(`${result.rowCount} Zeile(n) exportiert.`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Fehler beim Exportieren der Daten.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Sommerfreizeit Export</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedEventId}
            onValueChange={(val) => setSelectedEventId(val ?? '')}
            items={events.map((event) => ({ value: event.id, label: event.name }))}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="-- Freizeit auswählen --" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={isExporting || !selectedEventId}>
            <Download className="size-4" />
            {isExporting ? 'Exportiere...' : 'CSV exportieren'}
          </Button>
        </div>
      </div>

      <p className="text-sm text-(--theme-text-500)">
        Exportiert alle Teilnehmer (tn) und Mitarbeiter (ma) der gewählten Freizeit als
        semikolon-getrennte CSV-Datei. Teilnahmezeitraum und Dauer werden aus den Freizeit-Daten
        übernommen.
      </p>

      {events.length === 0 && (
        <p className="text-sm text-(--theme-text-500)">Es sind noch keine Freizeiten angelegt.</p>
      )}
    </div>
  )
}
