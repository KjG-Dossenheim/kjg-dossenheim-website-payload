'use client'

import React, { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { Button } from '@/components/ui/button'
import { PacklistePDF } from '@/components/common/PacklistePDF'

export interface PacklisteDownloadButtonProps {
  /** The full Lexical rich text from `packliste.text` */
  packlisteText: SerializedEditorState
}

export const PacklisteDownloadButton: React.FC<PacklisteDownloadButtonProps> = ({
  packlisteText,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (isGenerating) return
    setIsGenerating(true)

    try {
      const blob = await pdf(<PacklistePDF data={packlisteText.root} />).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'packliste.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Fehler beim Erzeugen der PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} variant="outline" size="default">
      {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
      {isGenerating ? 'Wird erstellt …' : 'Als PDF herunterladen'}
    </Button>
  )
}
