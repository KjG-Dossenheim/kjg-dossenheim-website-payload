'use server'

import { login } from '@payloadcms/next/auth'
import config from '@payload-config'

export async function loginAction({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    const result = await login({
      collection: 'sommerfreizeitUser',
      config,
      email,
      password,
    })
    return result
  } catch (error) {
    throw new Error(
      `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}