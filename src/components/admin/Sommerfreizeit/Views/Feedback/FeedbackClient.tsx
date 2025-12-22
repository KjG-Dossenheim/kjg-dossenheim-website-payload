'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import type { SommerfreizeitFeedback } from '@/payload-types'
import { DataTable } from './DataTable'
import { columns, type FeedbackData } from './columns'

type FeedbackClientProps = {
  feedback: SommerfreizeitFeedback[]
}

export function FeedbackClient({ feedback }: FeedbackClientProps) {
  // Transform data
  const feedbackData: FeedbackData[] = feedback.map((item) => ({
    id: item.id,
    age: item.age,
    rating: item.rating,
    comments: item.comments || null,
    createdAt: item.createdAt,
  }))

  // Empty state
  if (feedbackData.length === 0) {
    return (
      <Gutter>
        <div
          style={{
            textAlign: 'center',
            padding: 'calc(var(--base) * 3)',
            color: 'var(--theme-elevation-500)',
          }}
        >
          <p>Kein Feedback vorhanden.</p>
        </div>
      </Gutter>
    )
  }

  // Render table
  return (
    <Gutter>
      <DataTable columns={columns} data={feedbackData} />
    </Gutter>
  )
}

export default FeedbackClient
