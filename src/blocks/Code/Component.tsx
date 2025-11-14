import React from 'react'
import dynamic from 'next/dynamic'

const Code = dynamic(() => import('./Component.client').then((mod) => ({ default: mod.Code })), {
  loading: () => (
    <div className="border-border rounded border bg-black p-4">
      <div className="h-32 animate-pulse rounded bg-gray-800" />
    </div>
  ),
})

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Code code={code} language={language} />
    </div>
  )
}
