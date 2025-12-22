'use client'

import React from 'react'
import { DefaultEditView } from '@payloadcms/ui'
import type { DocumentViewClientProps } from 'payload'

export const AnmeldungCreateView: React.FC<DocumentViewClientProps> = (props) => {
  return (
    <div>
      <DefaultEditView {...props} />
    </div>
  )
}

export default AnmeldungCreateView
