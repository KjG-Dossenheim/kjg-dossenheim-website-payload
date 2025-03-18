// pages/index.js

'use client'

import React from 'react'

export default function RebuildButton() {
  const triggerNetlifyBuild = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_REBUILD_HOOK) {
        console.error('NEXT_PUBLIC_REBUILD_HOOK environment variable is not defined.')
        alert('Rebuild hook environment variable is not set.')
        return // Exit if the env variable is missing
      }

      const response = await fetch(process.env.NEXT_PUBLIC_REBUILD_HOOK, {
        method: 'POST',
      })

      if (response.ok) {
        console.log('Netlify build triggered successfully!')
        alert('Build triggered successfully!')
      } else {
        console.error('Failed to trigger Netlify build:', response.statusText)
        alert('Failed to trigger build. Check the console.')
      }
    } catch (error) {
      console.error('Error triggering Netlify build:', error)
      alert('An error occurred. Check the console.')
    }
  }

  return (
    <div>
      <button className="btn btn--style-secondary btn--size-medium" onClick={triggerNetlifyBuild}>
        Veröffentlichen
      </button>
    </div>
  )
}
