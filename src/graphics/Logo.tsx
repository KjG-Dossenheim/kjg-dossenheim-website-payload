import React from 'react'
import Image from 'next/image'

export const Logo = () => (
  <div className="logo">
    <Image src="/assets/logo.png" alt="TRBL Design Logo" layout="fill" objectFit="contain" />
  </div>
)

export default Logo
