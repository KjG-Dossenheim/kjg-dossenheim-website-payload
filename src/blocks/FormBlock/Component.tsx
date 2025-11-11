import React from 'react'
import type { Form } from '@/payload-types'

import { FormClient } from './Component.Client'

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
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <FormClient form={form} introContent={introContent} />
    </div>
  )
}
