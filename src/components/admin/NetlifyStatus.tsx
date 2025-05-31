'use client'

import React from 'react'

export default function NetlifyStatus() {
  return (
    <div className="relative">
      <a
        href="https://app.netlify.com/sites/kjg-dossenheim-payload/deploys"
        title="Netlify Deploy Status"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://api.netlify.com/api/v1/badges/6c54f09b-21e6-4c9c-9ca0-1d2e6694bc51/deploy-status"
          alt="Netlify Deploy Status"
        />
      </a>
    </div>
  )
}
