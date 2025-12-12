'use client'

import React, { useState } from 'react'
import { toast, Button, Modal, useModal } from '@payloadcms/ui'
import { formatDate } from 'date-fns'
import { pdf } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { fetchRegistrationsForExport, fetchKnallbonbonEvents } from './actions'
import type { Event, Registration } from './schema'
import { RegistrationsDocument } from './pdfGenerator'
import { generateCSV } from './csvGenerator'

import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CardHeader, CardContent, CardFooter } from '@/components/ui/card'

export const KnallbonbonRegistrationExportAction: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false)
  const { toggleModal } = useModal()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const result = await fetchKnallbonbonEvents()

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Veranstaltungen')
      }

      setEvents(result.data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Fehler beim Laden der Veranstaltungen')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleOpenModal = async () => {
    await fetchEvents()
    toggleModal('knallbonbon-export-modal')
  }

  const handleCloseModal = () => {
    toggleModal('knallbonbon-export-modal')
    setSelectedEventId('all')
    setExportFormat('pdf')
  }

  const handleExport = async () => {
    setIsExporting(true)
    toggleModal('knallbonbon-export-modal')
    try {
      const result = await fetchRegistrationsForExport(selectedEventId)

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Daten')
      }

      const registrations: Registration[] = result.data || []

      if (registrations.length === 0) {
        toast.warning('Keine Anmeldungen zum Exportieren vorhanden')
        return
      }

      // Count total children
      const totalChildren = registrations.reduce((sum, reg) => sum + (reg.child?.length || 0), 0)

      if (totalChildren === 0) {
        toast.warning('Keine Kinder in den Anmeldungen gefunden')
        return
      }

      const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm')
      const eventSuffix = selectedEventId !== 'all' ? `_${selectedEventId}` : ''

      if (exportFormat === 'pdf') {
        // Generate PDF and force direct download
        const blob = await pdf(<RegistrationsDocument registrations={registrations} />).toBlob()
        const blobUrl = URL.createObjectURL(blob)
        const filename = `knallbonbon-teilnehmer${eventSuffix}_${timestamp}.pdf`

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } else {
        // Generate CSV
        const csvContent = generateCSV(registrations)
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `knallbonbon-teilnehmer${eventSuffix}_${timestamp}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }

      toast.success(
        `${totalChildren} ${totalChildren === 1 ? 'Kind' : 'Kinder'} erfolgreich als ${exportFormat.toUpperCase()} exportiert`,
      )
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Fehler beim Exportieren der Daten')
    } finally {
      setIsExporting(false)
      setSelectedEventId('all')
      setExportFormat('pdf')
    }
  }

  return (
    <>
      <Button
        buttonStyle="secondary"
        onClick={handleOpenModal}
        disabled={isExporting}
        icon={<Download className="size-4" />}
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            Exportiere...
          </>
        ) : (
          <>Exportieren</>
        )}
      </Button>
      <Modal
        slug="knallbonbon-export-modal"
        className="flex items-center justify-center backdrop-blur-sm"
      >
        <div>
          <CardHeader>
            <h1>Veranstaltung auswählen</h1>
            <p>Welche Anmeldungen möchten Sie exportieren?</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel>Veranstaltung</FieldLabel>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
                disabled={isLoadingEvents}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Veranstaltung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Veranstaltungen</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title || 'Knallbonbon'} -{' '}
                      {event.date
                        ? formatDate(new Date(event.date), 'dd.MM.yyyy HH:mm')
                        : 'Kein Datum'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Export-Format</FieldLabel>
              <Select
                value={exportFormat}
                onValueChange={(value: 'pdf' | 'csv') => setExportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wähle ein Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Formatierte Tabelle</SelectItem>
                  <SelectItem value="csv">CSV - Excel/Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
          <CardFooter className="flex flex-row gap-2">
            <Button buttonStyle="secondary" onClick={handleCloseModal} className="m-0" size="large">
              Abbrechen
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoadingEvents}
              icon={<Download className="size-4" />}
              className="m-0"
              size="large"
            >
              Exportieren
            </Button>
          </CardFooter>
        </div>
      </Modal>
    </>
  )
}

export default KnallbonbonRegistrationExportAction
