import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import { FeedbackClient } from './FeedbackClient'

export async function Feedback({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const {
    req: { user, payload },
  } = initPageResult

  if (!user) {
    redirect('/admin/login?redirect=/admin/sommerfreizeit/feedback')
  }

  // Fetch feedback data
  const feedbackResult = await payload.find({
    collection: 'sommerfreizeitFeedback',
    limit: 1000,
    depth: 0,
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
        <h1>Sommerfreizeit Feedback</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-500)' }}>
          Alle eingereichten Feedback-Einträge
        </p>
      </Gutter>
      <FeedbackClient feedback={feedbackResult.docs} />
    </DefaultTemplate>
  )
}

export default Feedback
