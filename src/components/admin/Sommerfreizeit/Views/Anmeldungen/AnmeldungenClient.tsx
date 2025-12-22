'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import type { SommerfreizeitAnmeldung } from '@/payload-types'
import { DataTable } from './DataTable'
import { columns, type AnmeldungData } from './Columns'

type AnmeldungenClientProps = {
  anmeldungen: SommerfreizeitAnmeldung[]
}

export function AnmeldungenClient({ anmeldungen }: AnmeldungenClientProps) {
  // Transform data
  const anmeldungenData: AnmeldungData[] = anmeldungen.map((item) => {
    const user = item.user
    const userEmail = typeof user === 'object' && user ? user.email : null
    const userPhone = typeof user === 'object' && user ? user.phone : null

    return {
      id: item.id,
      name: `${item.firstName} ${item.lastName}`,
      firstName: item.firstName,
      lastName: item.lastName,
      dateOfBirth: item.dateOfBirth,
      gender: item.gender,
      class: item.class || null,
      city: item.city,
      userEmail,
      userPhone,
      createdAt: item.createdAt,
    }
  })

  // Empty state
  if (anmeldungenData.length === 0) {
    return (
      <Gutter>
        <div
          style={{
            textAlign: 'center',
            padding: 'calc(var(--base) * 3)',
            color: 'var(--theme-elevation-500)',
          }}
        >
          <p>Keine Anmeldungen vorhanden.</p>
        </div>
      </Gutter>
    )
  }

  // Render table
  return (
    <Gutter>
      <DataTable columns={columns} data={anmeldungenData} />
    </Gutter>
  )
}

export default AnmeldungenClient
