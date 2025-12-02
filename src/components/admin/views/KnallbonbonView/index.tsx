import { Button, Gutter } from '@payloadcms/ui'
import React from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ListViewServerProps, AfterListServerProps, BeforeListServerProps } from 'payload'
import { KnallbonbonRegistrationOverview } from '@/components/admin/afterList/KnallbonbonRegistrationOverview'
import { KnallbonbonRegistrationStats } from '@/components/admin/beforeList/KnallbonbonRegistrationStats'

export async function KnallbonbonView(props: ListViewServerProps) {
  const { user, payload } = props

  if (!user) {
    redirect('/admin/login?redirect=/admin/knallbonbon')
  }

  // Render the registrations stats and overview components
  const overviewComponent = await KnallbonbonRegistrationOverview({
    payload,
  } as AfterListServerProps)
  const statsComponent = await KnallbonbonRegistrationStats({ payload } as BeforeListServerProps)

  return (
    <>
      <Gutter className="flex items-center gap-6">
        <h1>Knallbonbon</h1>
        <Button
          url="/admin/globals/knallbonbon"
          el="anchor"
          icon="edit"
          buttonStyle="icon-label"
          className="m-0"
        ></Button>
      </Gutter>
      {statsComponent}
      {overviewComponent}
    </>
  )
}

export default KnallbonbonView
