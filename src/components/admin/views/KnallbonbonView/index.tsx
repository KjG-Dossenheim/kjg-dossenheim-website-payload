import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Team } from '@/payload-types'

export async function KnallbonbonView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/knallbonbon')
  }

  // Fetch the Knallbonbon global data
  const knallbonbonData = await payload.findGlobal({
    slug: 'knallbonbon',
  })

  // Fetch team members if there are any
  let teamMembers: Array<Team> = []
  if (knallbonbonData.team && Array.isArray(knallbonbonData.team)) {
    const teamIds = knallbonbonData.team.map((t) => (typeof t === 'object' ? t.id : t))
    if (teamIds.length > 0) {
      const teamData = await payload.find({
        collection: 'team',
        where: {
          id: {
            in: teamIds,
          },
        },
      })
      teamMembers = teamData.docs
    }
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Knallbonbon Informationen</h1>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Titel
            </h2>
            <p>{knallbonbonData.title || 'Nicht festgelegt'}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Beschreibung
            </h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {knallbonbonData.description || 'Nicht festgelegt'}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Team</h2>
            {teamMembers.length > 0 ? (
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                {teamMembers.map((member) => (
                  <li key={member.id}>
                    {member.firstName} {member.lastName}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Keine Teammitglieder ausgewählt</p>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link
              href="/admin/globals/knallbonbon"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.375rem',
              }}
            >
              Bearbeiten
            </Link>
          </div>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}

export default KnallbonbonView
