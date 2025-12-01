'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BarChart3, List } from 'lucide-react'
import { Gutter } from '@payloadcms/ui'
import { ChildrenListView } from './ChildrenListView'
import type { KnallbonbonRegistration, KnallbonbonEvents } from '@/payload-types'

type ViewToggleProps = {
  registrations: Array<KnallbonbonRegistration & { event: KnallbonbonEvents | string }>
  events: KnallbonbonEvents[]
  statsView: React.ReactNode
}

export function ViewToggle({ registrations, events, statsView }: ViewToggleProps) {
  const [view, setView] = useState<'stats' | 'children'>('stats')

  return (
    <>
      <Gutter className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">
          {view === 'stats' ? 'Statistiken' : 'Kinderliste'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={view === 'stats' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('stats')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistiken
          </Button>
          <Button
            variant={view === 'children' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('children')}
          >
            <List className="mr-2 h-4 w-4" />
            Kinderliste
          </Button>
        </div>
      </Gutter>

      {view === 'stats' ? (
        statsView
      ) : (
        <Gutter>
          <ChildrenListView registrations={registrations} events={events} />
        </Gutter>
      )}
    </>
  )
}
