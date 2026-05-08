import type { BetterAuthOptions } from 'better-auth'

const betterAuthBaseUrl =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const betterAuthOptions: Partial<BetterAuthOptions> = {
  baseURL: betterAuthBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET || '',
  user: {
    modelName: 'sommerfreizeitUser',
    additionalFields: {
      firstName: { type: 'string', required: true },
      lastName: { type: 'string', required: true },
      phone: { type: 'string', required: false },
      address: { type: 'string', required: false },
      postalCode: { type: 'string', required: false },
      city: { type: 'string', required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  emailAndPassword: {
    enabled: false,
    requireEmailVerification: false,
  },
}