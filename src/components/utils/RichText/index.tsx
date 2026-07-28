import {
  JSXConvertersFunction,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { DefaultNodeTypes } from '@payloadcms/richtext-lexical'

type NodeTypes = DefaultNodeTypes

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    ...defaultConverters.blocks,
  },
})

export const RichText = ({ data }: { data: SerializedEditorState }) => {
  return <LexicalRichText converters={jsxConverters} data={data} />
}
