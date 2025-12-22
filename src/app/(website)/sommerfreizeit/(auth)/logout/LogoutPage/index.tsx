'use client'

import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import { logoutAction } from '../../_util/logoutAction'

export const LogoutPage: React.FC = () => {
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const performLogout = async () => {
      await logoutAction()
      setSuccess(true)
    }
    void performLogout()
  }, [])

  return (
    <Fragment>
      {success && (
        <div>
          <h1>Logged out successfully.</h1>
          <p>
            {'What would you like to do next? '}
            <Link href="/">Click here</Link>
            {` to go to the home page. To log back in, `}
            <Link href="/sommerfreizeit/login">click here</Link>.
          </p>
        </div>
      )}
    </Fragment>
  )
}
