'use client'

import { createAuthClient, twoFactorClient } from '@delmaredigital/payload-better-auth/client'
import { magicLinkClient } from 'better-auth/client/plugins'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    magicLinkClient(),
    emailOTPClient()],
})

export const { useSession, signIn, signUp, signOut, twoFactor, magicLink } = authClient