'use server'

import { refresh } from '@payloadcms/next/auth'
import config from '@payload-config'

export async function refreshAction() {
  try {
    return await refresh({
      config,
    })
  } catch (error) {
    throw new Error(
      `Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}