'use client'

import { createAuthClient, payloadAuthPlugins } from '@delmaredigital/payload-better-auth/client'
import { magicLinkClient } from 'better-auth/client/plugins'

export const sommerfreizeitAuthClient = createAuthClient({
  plugins: [...payloadAuthPlugins, magicLinkClient()],
})
