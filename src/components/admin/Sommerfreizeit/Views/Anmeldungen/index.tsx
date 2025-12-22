import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import { AnmeldungenClient } from './AnmeldungenClient'

export async function SommerfreizeitAnmeldungen({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/sommerfreizeit/anmeldungen')
  }

  // Fetch anmeldungen data with depth 1 to populate user relationship
  const anmeldungenResult = await payload.find({
    collection: 'sommerfreizeitAnmeldung',
    limit: 1000,
    depth: 1,
    sort: '-createdAt',
  })

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
        <h1>Sommerfreizeit Anmeldungen</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
          Alle eingereichten Anmeldungen für die Sommerfreizeit
        </p>
      </Gutter>
      <AnmeldungenClient anmeldungen={anmeldungenResult.docs} />
    </DefaultTemplate>
  )
}

export default SommerfreizeitAnmeldungen
