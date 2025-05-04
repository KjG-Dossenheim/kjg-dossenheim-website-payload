'use client'

import { useRowLabel } from '@payloadcms/ui'

const ArrayRowLabelName = () => {
  const { data } = useRowLabel<{ name?: string }>()

  return <div>{data.name || 'Kein Name'}</div>
}

export default ArrayRowLabelName
