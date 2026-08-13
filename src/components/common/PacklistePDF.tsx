import React from 'react'
import { Document, Page, Text, View, StyleSheet, Svg, Line } from '@react-pdf/renderer'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// ---------------------------------------------------------------------------
// Types for Lexical serialized nodes we need to walk
// ---------------------------------------------------------------------------

interface SerializedTextNode {
  type: 'text'
  text: string
  format?: number
  detail?: number
  mode?: string
  style?: string
  version: number
}

interface SerializedElementNode {
  type: string
  children?: SerializedLexicalNode[]
  direction?: 'ltr' | 'rtl' | null
  format?: string | number
  indent?: number
  version: number
}

interface SerializedHeadingNode extends SerializedElementNode {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface SerializedParagraphNode extends SerializedElementNode {
  type: 'paragraph'
}

interface SerializedListNode extends SerializedElementNode {
  type: 'list'
  listType: 'bullet' | 'number' | 'check'
  start?: number
}

interface SerializedListItemNode extends SerializedElementNode {
  type: 'listitem'
  checked?: boolean
  value?: number
}

interface SerializedLinkNode extends SerializedElementNode {
  type: 'link'
  url?: string
  rel?: string | null
  target?: string | null
}

interface SerializedQuoteNode extends SerializedElementNode {
  type: 'quote'
}

interface SerializedLinebreakNode {
  type: 'linebreak'
  version: number
}

type SerializedLexicalNode =
  | SerializedTextNode
  | SerializedHeadingNode
  | SerializedParagraphNode
  | SerializedListNode
  | SerializedListItemNode
  | SerializedLinkNode
  | SerializedQuoteNode
  | SerializedLinebreakNode
  | SerializedElementNode

// ---------------------------------------------------------------------------
// Text format bitfield helpers
// ---------------------------------------------------------------------------

const IS_BOLD = 1
const IS_ITALIC = 2
const IS_UNDERLINE = 4
const IS_STRIKETHROUGH = 8

function decodeFormat(format: number) {
  return {
    bold: (format & IS_BOLD) !== 0,
    italic: (format & IS_ITALIC) !== 0,
    underline: (format & IS_UNDERLINE) !== 0,
    strikethrough: (format & IS_STRIKETHROUGH) !== 0,
  }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  heading1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
    color: '#2a2a2a',
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#3a3a3a',
  },
  heading4: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#4a4a4a',
  },
  paragraph: {
    marginBottom: 4,
    fontSize: 11,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
    paddingRight: 8,
  },
  checkboxOuter: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: '#555',
    borderStyle: 'solid',
    borderRadius: 2,
    marginRight: 6,
    marginTop: 2,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },
  link: {
    color: '#005e7e',
    textDecoration: 'underline',
  },
  quote: {
    marginLeft: 16,
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ccc',
    borderLeftStyle: 'solid',
    fontSize: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
})

// ---------------------------------------------------------------------------
// Recursive renderer: converts Lexical JSON tree → @react-pdf elements
// ---------------------------------------------------------------------------

/**
 * Extract plain text from a node's children (for fallback rendering).
 */
function getPlainText(children: SerializedLexicalNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'text') return (child as SerializedTextNode).text
      if ('children' in child && child.children) return getPlainText(child.children)
      return ''
    })
    .join('')
}

/**
 * Render inline text children (text, linebreak, link) as an array of <Text> fragments.
 * Handles bold / italic / underline / strikethrough.
 */
function renderInlineChildren(children: SerializedLexicalNode[]): React.ReactNode[] {
  return children.map((child, i) => {
    if (child.type === 'linebreak') {
      return '\n'
    }

    if (child.type === 'text') {
      const textNode = child as SerializedTextNode
      const fmt = decodeFormat(textNode.format ?? 0)
      const style: {
        fontWeight?: 'bold'
        fontStyle?: 'italic'
        textDecoration?: 'underline' | 'line-through'
      } = {}
      if (fmt.bold) style.fontWeight = 'bold'
      if (fmt.italic) style.fontStyle = 'italic'
      if (fmt.underline) style.textDecoration = 'underline'
      if (fmt.strikethrough) style.textDecoration = 'line-through'

      return (
        <Text key={i} style={style}>
          {textNode.text}
        </Text>
      )
    }

    if (child.type === 'link') {
      const linkNode = child as SerializedLinkNode
      return (
        <Text key={i} style={styles.link}>
          {linkNode.children ? renderInlineChildren(linkNode.children) : linkNode.url}
        </Text>
      )
    }

    // Fallback: render unknown inline nodes as plain text
    if ('children' in child && child.children) {
      return <Text key={i}>{renderInlineChildren(child.children as SerializedLexicalNode[])}</Text>
    }

    return null
  })
}

/**
 * Main recursive renderer — maps Lexical node types to PDF elements.
 * `level` tracks nesting depth for indentation (lists inside lists).
 */
function renderNodes(nodes: SerializedLexicalNode[], level = 0): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${node.type}-${index}`

    switch (node.type) {
      // ── Heading ────────────────────────────────────────────────
      case 'heading': {
        const heading = node as SerializedHeadingNode
        const headingStyles: Record<string, typeof styles.heading1> = {
          h1: styles.heading1,
          h2: styles.heading2,
          h3: styles.heading3,
          h4: styles.heading4,
          h5: styles.heading4,
          h6: styles.heading4,
        }
        const headingStyle = headingStyles[heading.tag] ?? styles.heading2
        return (
          <Text key={key} style={headingStyle}>
            {heading.children
              ? renderInlineChildren(heading.children as SerializedLexicalNode[])
              : ''}
          </Text>
        )
      }

      // ── Paragraph ──────────────────────────────────────────────
      case 'paragraph': {
        const para = node as SerializedParagraphNode
        // Empty paragraph → spacing
        if (!para.children || para.children.length === 0) {
          return <View key={key} style={{ height: 8 }} />
        }
        // Check if paragraph is truly empty (only an empty text node)
        const text = getPlainText(para.children as SerializedLexicalNode[])
        if (text.trim() === '') {
          return <View key={key} style={{ height: 8 }} />
        }
        return (
          <Text key={key} style={styles.paragraph}>
            {renderInlineChildren(para.children as SerializedLexicalNode[])}
          </Text>
        )
      }

      // ── List ───────────────────────────────────────────────────
      case 'list': {
        const list = node as SerializedListNode
        if (!list.children) return null
        return (
          <View key={key} style={{ marginLeft: level * 16 }}>
            {renderNodes(list.children as SerializedLexicalNode[], level)}
          </View>
        )
      }

      // ── List Item ──────────────────────────────────────────────
      case 'listitem': {
        const item = node as SerializedListItemNode
        const checked = item.checked === true
        const children = (item.children as SerializedLexicalNode[]) ?? []

        // Split: inline nodes get rendered via renderInlineChildren,
        // block nodes (nested lists, paragraphs) go through renderNodes.
        const inlineTypes = new Set(['text', 'link', 'linebreak'])
        const inlineChildren = children.filter((c) => inlineTypes.has(c.type))
        const blockChildren = children.filter((c) => !inlineTypes.has(c.type))

        return (
          <View key={key} style={styles.listItemRow} wrap={false}>
            {/* Bordered square checkbox (no Unicode — works in all PDF viewers) */}
            <View style={styles.checkboxOuter}>
              {checked && (
                <Svg width={7} height={7} viewBox="0 0 7 7">
                  <Line x1={0.5} y1={0.5} x2={6.5} y2={6.5} stroke="#555" strokeWidth={1.2} />
                  <Line x1={6.5} y1={0.5} x2={0.5} y2={6.5} stroke="#555" strokeWidth={1.2} />
                </Svg>
              )}
            </View>
            <View style={styles.itemText}>
              {inlineChildren.length > 0 && <Text>{renderInlineChildren(inlineChildren)}</Text>}
              {blockChildren.length > 0 && renderNodes(blockChildren, level + 1)}
            </View>
          </View>
        )
      }

      // ── Quote ──────────────────────────────────────────────────
      case 'quote': {
        const quote = node as SerializedQuoteNode
        return (
          <View key={key} style={styles.quote}>
            {quote.children ? renderNodes(quote.children as SerializedLexicalNode[], level) : null}
          </View>
        )
      }

      // ── Fallback for unknown block nodes ───────────────────────
      default: {
        if ('children' in node && node.children) {
          // Try to render children; if no recognised type, render plain text
          const text = getPlainText(node.children as SerializedLexicalNode[])
          if (text.trim()) {
            return (
              <Text key={key} style={styles.paragraph}>
                {text}
              </Text>
            )
          }
          // Otherwise try recursive rendering
          return (
            <View key={key}>{renderNodes(node.children as SerializedLexicalNode[], level)}</View>
          )
        }
        return null
      }
    }
  })
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PacklistePDFProps {
  /** The Lexical rich text JSON (the `root` object from SerializedEditorState) */
  data: SerializedEditorState['root']
}

// ---------------------------------------------------------------------------
// Document component
// ---------------------------------------------------------------------------

export const PacklistePDF: React.FC<PacklistePDFProps> = ({ data }) => {
  const children = (data as { children?: SerializedLexicalNode[] }).children ?? []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Page numbers */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`}
          fixed
        />

        {/* Title */}
        <Text style={styles.title}>Packliste</Text>

        {/* Content */}
        {renderNodes(children as SerializedLexicalNode[])}
      </Page>
    </Document>
  )
}
