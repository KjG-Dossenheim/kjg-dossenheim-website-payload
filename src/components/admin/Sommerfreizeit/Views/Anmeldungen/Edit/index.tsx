import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'

export async function AnmeldungEditView({
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

  // Extract the ID from params - in Payload admin views with :id pattern,
  // the ID is typically in the last segment
  const id = searchParams?.id as string | undefined || params?.segments?.[params.segments.length - 1]

  if (!id) {
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
          <h1>Fehler</h1>
          <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
            Keine Anmeldungs-ID gefunden. Params: {JSON.stringify(params)}
          </p>
        </Gutter>
      </DefaultTemplate>
    )
  }

  // Fetch the registration data
  let anmeldung
  try {
    anmeldung = await payload.findByID({
      collection: 'sommerfreizeitAnmeldung',
      id: id,
      depth: 2,
    })
  } catch (error) {
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
          <h1>Fehler beim Laden</h1>
          <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
            Anmeldung mit ID {id} konnte nicht geladen werden: {String(error)}
          </p>
        </Gutter>
      </DefaultTemplate>
    )
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
        <h1>Anmeldung bearbeiten</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
          {anmeldung.firstName} {anmeldung.lastName}
        </p>
        {/* Add your custom edit UI here */}
        <pre>{JSON.stringify(anmeldung, null, 2)}</pre>
      </Gutter>
    </DefaultTemplate>
  )
}

export default AnmeldungEditView
