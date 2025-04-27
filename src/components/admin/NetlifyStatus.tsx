'use client'

import React from 'react'
import Image from 'next/image'

export default function NetlifyStatus() {
  return (
    <div>
      <a href="https://app.netlify.com/sites/kjg-dossenheim-payload/deploys">
        <Image
          src="https://api.netlify.com/api/v1/badges/6c54f09b-21e6-4c9c-9ca0-1d2e6694bc51/deploy-status"
          alt="Netlify Status"
        />
      </a>
    </div>
  )
}
