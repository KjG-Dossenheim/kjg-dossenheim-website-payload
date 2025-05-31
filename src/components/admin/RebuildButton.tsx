// pages/index.js

'use client'

import React from 'react'
import { Button, toast } from '@payloadcms/ui'

export default function RebuildButton() {
  const triggerNetlifyBuild = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_REBUILD_HOOK) {
        console.error('NEXT_PUBLIC_REBUILD_HOOK environment variable is not defined.')
        toast.error('Rebuild hook environment variable is not set.')
        return // Exit if the env variable is missing
      }

      const response = await fetch(process.env.NEXT_PUBLIC_REBUILD_HOOK, {
        method: 'POST',
      })

      if (response.ok) {
        console.log('Netlify build triggered successfully!')
        toast.success('Build triggered successfully!')
      } else {
        console.error('Failed to trigger Netlify build:', response.statusText)
        toast.error('Failed to trigger build. Check the console.')
      }
    } catch (error) {
      console.error('Error triggering Netlify build:', error)
      toast.error('An error occurred. Check the console.')
    }
  }

  return (
    <div>
      <Button onClick={triggerNetlifyBuild}>Veröffentlichen</Button>
    </div>
  )
}
