'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { fetchRegistrationDetails } from './actions'
import type { RegistrationDetails } from './types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

const genderLabels: Record<'male' | 'female' | 'diverse', string> = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
}

const foodPreferenceLabels: Record<'none' | 'vegetarisch' | 'vegan', string> = {
  none: 'Keine',
  vegetarisch: 'Vegetarisch',
  vegan: 'Vegan',
}

function formatDate(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('de-DE')
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-medium wrap-break-word">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h4>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  )
}

interface ChildDetailsDrawerProps {
  id: string
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChildDetailsDrawer({ id, name, open, onOpenChange }: ChildDetailsDrawerProps) {
  const [details, setDetails] = useState<RegistrationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !id) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchRegistrationDetails(id)
      .then((result) => {
        if (cancelled) return
        if (result.success && result.details) {
          setDetails(result.details)
        } else {
          setError(result.error ?? 'Die Anmeldung konnte nicht geladen werden.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Die Anmeldung konnte nicht geladen werden.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, id])

  const hasHealthData =
    !!details &&
    (!!details.otherAllergies ||
      !!details.medicalConditions ||
      !!details.medikamente ||
      (details.medikamenteList?.length ?? 0) > 0 ||
      !!details.arzt)
  const hasNutritionData =
    !!details &&
    (!!details.foodAllergies || (!!details.foodPreferences && details.foodPreferences !== 'none'))
  const hasContactData =
    !!details?.contact &&
    (!!details.contact.firstName ||
      !!details.contact.lastName ||
      !!details.contact.phone ||
      !!details.contact.email)

  return (
    <Drawer modal swipeDirection="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-base">{name}</DrawerTitle>
          <DrawerDescription>
            {details ? (
              <>{details.age != null ? `${details.age} Jahre` : null}</>
            ) : (
              'Anmeldedaten werden geladen …'
            )}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 pt-3">
          {loading && !details && !error && (
            <div className="text-muted-foreground flex justify-center py-8">
              <Spinner />
            </div>
          )}

          {error && !details && <p className="text-destructive text-sm">{error}</p>}

          {details && (
            <>
              <Section title="Persönliches">
                <InfoRow
                  label="Geschlecht"
                  value={details.gender ? genderLabels[details.gender] : null}
                />
                <InfoRow label="Geburtsdatum" value={formatDate(details.dateOfBirth)} />
                <InfoRow
                  label="Alter"
                  value={details.age != null ? `${details.age} Jahre` : null}
                />
              </Section>

              {details.bemerkungen && (
                <Section title="Bemerkungen">
                  <p className="text-sm">{details.bemerkungen}</p>
                </Section>
              )}

              {hasHealthData && (
                <Section title="Gesundheit">
                  <InfoRow label="Sonstige Allergien" value={details.otherAllergies} />
                  <InfoRow label="Vorerkrankungen" value={details.medicalConditions} />
                  <InfoRow label="Medikamente" value={details.medikamente} />
                  {details.medikamenteList?.map((med, i) => (
                    <InfoRow
                      key={`${med.name}-${i}`}
                      label="Medikament"
                      value={[med.name, med.dosierung].filter(Boolean).join(' — ')}
                    />
                  ))}
                  <InfoRow
                    label="Arzt"
                    value={[details.arzt, details.arztTelefon].filter(Boolean).join(' · ')}
                  />
                </Section>
              )}

              {hasNutritionData && (
                <Section title="Ernährung">
                  <InfoRow label="Lebensmittelallergien" value={details.foodAllergies} />
                  {details.foodPreferences && details.foodPreferences !== 'none' && (
                    <InfoRow
                      label="Ernährungspräferenz"
                      value={foodPreferenceLabels[details.foodPreferences]}
                    />
                  )}
                </Section>
              )}

              <Section title="Zimmer">
                <InfoRow label="Zugewiesenes Zimmer" value={details.roomName} />
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground shrink-0">Zimmerwünsche</span>
                  {details.roomWishes.length > 0 ? (
                    <ul className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                      {details.roomWishes.map((wish) => (
                        <li key={wish} className="font-medium wrap-break-word">
                          {wish}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">Keine</span>
                  )}
                </div>
              </Section>

              {hasContactData && (
                <Section title="Notfallkontakt">
                  <InfoRow
                    label="Name"
                    value={
                      [details.contact?.firstName, details.contact?.lastName]
                        .filter(Boolean)
                        .join(' ') || null
                    }
                  />
                  <InfoRow label="Telefon" value={details.contact?.phone} />
                  <InfoRow label="E-Mail" value={details.contact?.email} />
                </Section>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="flex-row justify-end gap-2 border-t pt-3">
          <Button
            variant="outline"
            render={
              <Link
                href={`/admin/collections/sommerfreizeitAnmeldung/${id}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLink />
            In der Verwaltung öffnen
          </Button>
          <DrawerClose render={<Button variant="ghost">Schließen</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
