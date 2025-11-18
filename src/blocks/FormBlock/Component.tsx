import React from 'react'
import dynamic from 'next/dynamic'
import type { Form } from '@/payload-types'
import { cn } from '@/lib/utils'

const FormClient = dynamic(
  () => import('./Component.Client').then((mod) => ({ default: mod.FormClient })),
  {
    loading: () => (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded bg-gray-200" />
          <div className="h-12 animate-pulse rounded bg-gray-200" />
          <div className="h-12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    ),
  },
)

export type FormBlockProps = {
  form: Form
  enableIntro?: boolean
  introContent?: {
    root: {
      type: string
      children: Array<{
        type: string
        version: number
        [k: string]: unknown
      }>
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  }
  blockType: 'formBlock'
}

type Props = FormBlockProps & {
  className?: string
}

export const FormBlock: React.FC<Props> = ({ className, form, introContent }) => {
  return (
    <div className={cn(className, 'not-prose')}>
      <FormClient form={form} introContent={introContent} />
    </div>
  )
}
