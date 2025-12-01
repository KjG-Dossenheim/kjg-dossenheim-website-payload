'use client'

import React, { useEffect, useState } from 'react'
import { Gutter, Pill, useConfig } from '@payloadcms/ui'
import { formatDate } from 'date-fns'

interface Child {
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'diverse' | 'noInfo'
  pickupInfo?: 'pickedUp' | 'goesAlone'
  photoConsent?: boolean
  healthInfo?: string
}

interface Registration {
  id: string
  event:
    | {
        id: string
        title?: string
      }
    | string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  child: Child[]
  createdAt: string
  updatedAt: string
}

const genderLabels = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
}

const pickupLabels = {
  pickedUp: 'Wird abgeholt',
  goesAlone: 'Darf alleine nach Hause gehen',
}

export const KnallbonbonRegistrationView: React.FC = () => {
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch(
          `${serverURL}${api}/knallbonbonRegistration?depth=1&limit=1000`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        const result = await response.json()
        setRegistrations(result.docs || [])
      } catch (error) {
        console.error('Error fetching registrations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [serverURL, api])

  if (loading) {
    return (
      <Gutter>
        <div style={{ textAlign: 'center', padding: 'calc(var(--base) * 3)' }}>
          <p>Lade Anmeldungen...</p>
        </div>
      </Gutter>
    )
  }

  return (
    <Gutter>
      <div style={{ marginBottom: 'var(--base)' }}>
        <h1 className="render-title">Knallbonbon Anmeldungen</h1>
        <p style={{ marginTop: 'calc(var(--base) / 2)', color: 'var(--theme-elevation-500)' }}>
          Gesamt: {registrations.length} Anmeldung{registrations.length !== 1 ? 'en' : ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--base)' }}>
        {registrations.map((registration) => {
          const eventTitle =
            typeof registration.event === 'object' && registration.event !== null
              ? registration.event.title || 'Unbekannte Veranstaltung'
              : 'Unbekannte Veranstaltung'

          return (
            <div
              key={registration.id}
              style={{
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 'var(--border-radius-m)',
                padding: 'var(--base)',
                backgroundColor: 'var(--theme-elevation-0)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--base)',
                  flexWrap: 'wrap',
                  gap: 'calc(var(--base) / 2)',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                    {registration.firstName} {registration.lastName}
                  </h2>
                  <div style={{ marginTop: 'calc(var(--base) / 4)' }}>
                    <Pill>{eventTitle}</Pill>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '0.875rem',
                    color: 'var(--theme-elevation-500)',
                  }}
                >
                  <p style={{ margin: 0 }}>Angemeldet am</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    {formatDate(new Date(registration.createdAt), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--base)',
                  padding: 'var(--base)',
                  backgroundColor: 'var(--theme-elevation-50)',
                  borderRadius: 'var(--border-radius-s)',
                  marginBottom: 'var(--base)',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 'calc(var(--base) / 4)',
                    }}
                  >
                    E-Mail
                  </p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    <a
                      href={`mailto:${registration.email}`}
                      style={{ color: 'var(--theme-text)', textDecoration: 'underline' }}
                    >
                      {registration.email}
                    </a>
                  </p>
                </div>
                {registration.phone && (
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: 'calc(var(--base) / 4)',
                      }}
                    >
                      Telefon
                    </p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      <a
                        href={`tel:${registration.phone}`}
                        style={{ color: 'var(--theme-text)', textDecoration: 'underline' }}
                      >
                        {registration.phone}
                      </a>
                    </p>
                  </div>
                )}
                {registration.address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: 'calc(var(--base) / 4)',
                      }}
                    >
                      Adresse
                    </p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>{registration.address}</p>
                  </div>
                )}
              </div>

              {/* Children */}
              {registration.child && registration.child.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: 'calc(var(--base) / 2)',
                    }}
                  >
                    Kinder ({registration.child.length})
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'calc(var(--base) / 2)',
                    }}
                  >
                    {registration.child.map((child, index) => (
                      <div
                        key={index}
                        style={{
                          borderLeft: '4px solid var(--theme-success-500)',
                          paddingLeft: 'var(--base)',
                          paddingTop: 'calc(var(--base) / 2)',
                          paddingBottom: 'calc(var(--base) / 2)',
                          backgroundColor: 'var(--theme-success-50)',
                          borderRadius: '0 var(--border-radius-s) var(--border-radius-s) 0',
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: 'calc(var(--base) / 2)',
                          }}
                        >
                          {child.firstName} {child.lastName}
                        </p>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: 'calc(var(--base) / 2)',
                            fontSize: '0.875rem',
                          }}
                        >
                          {child.dateOfBirth && (
                            <div>
                              <span style={{ color: 'var(--theme-elevation-500)' }}>
                                Geburtsdatum:
                              </span>
                              <p style={{ fontWeight: 500, margin: 0 }}>
                                {formatDate(new Date(child.dateOfBirth), 'dd.MM.yyyy')}
                              </p>
                            </div>
                          )}
                          {child.gender && (
                            <div>
                              <span style={{ color: 'var(--theme-elevation-500)' }}>
                                Geschlecht:
                              </span>
                              <p style={{ fontWeight: 500, margin: 0 }}>
                                {genderLabels[child.gender]}
                              </p>
                            </div>
                          )}
                          {child.pickupInfo && (
                            <div>
                              <span style={{ color: 'var(--theme-elevation-500)' }}>Abholung:</span>
                              <p style={{ fontWeight: 500, margin: 0 }}>
                                {pickupLabels[child.pickupInfo]}
                              </p>
                            </div>
                          )}
                          <div>
                            <span style={{ color: 'var(--theme-elevation-500)' }}>Fotos:</span>
                            <p style={{ fontWeight: 500, margin: 0 }}>
                              {child.photoConsent ? '✓ Erlaubt' : '✗ Nicht erlaubt'}
                            </p>
                          </div>
                        </div>
                        {child.healthInfo && (
                          <div style={{ marginTop: 'calc(var(--base) / 2)' }}>
                            <span
                              style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-500)' }}
                            >
                              Gesundheitsinfo:
                            </span>
                            <p
                              style={{
                                fontSize: '0.875rem',
                                margin: 'calc(var(--base) / 4) 0 0 0',
                                padding: 'calc(var(--base) / 2)',
                                backgroundColor: 'var(--theme-warning-50)',
                                border: '1px solid var(--theme-warning-200)',
                                borderRadius: 'var(--border-radius-s)',
                              }}
                            >
                              {child.healthInfo}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {registrations.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'calc(var(--base) * 3)',
              color: 'var(--theme-elevation-500)',
            }}
          >
            <p>Keine Anmeldungen gefunden.</p>
          </div>
        )}
      </div>
    </Gutter>
  )
}

export default KnallbonbonRegistrationView
