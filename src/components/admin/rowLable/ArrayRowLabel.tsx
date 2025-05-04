'use client'

import { useRowLabel } from '@payloadcms/ui'

const ArrayRowLabel = () => {
  const { data } = useRowLabel<{ title?: string }>()

  return <div>{data.title || 'Kein Title'}</div>
}

export default ArrayRowLabel
