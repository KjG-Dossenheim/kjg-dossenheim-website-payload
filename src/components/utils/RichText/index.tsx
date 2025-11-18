import React from 'react'
import {
  JSXConvertersFunction,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
import { FormBlock, FormBlockProps } from '@/blocks/FormBlock/Component'
import Gallery, { GalleryBlockProps } from '@/blocks/gallery/Component'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CodeBlockProps>
  | SerializedBlockNode<FormBlockProps>

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    ...defaultConverters.blocks,
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    formBlock: ({ node }: { node: SerializedBlockNode<FormBlockProps> }) => (
      <FormBlock className="col-start-2" {...node.fields} />
    ),
    gallery: ({ node }: { node: SerializedBlockNode<GalleryBlockProps> }) => (
      <Gallery {...node.fields} />
    ),
  },
})

export const RichText = ({ data }: { data: SerializedEditorState }) => {
  return <LexicalRichText converters={jsxConverters} data={data} />
}
