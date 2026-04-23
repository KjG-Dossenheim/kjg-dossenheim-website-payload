import type { Payload } from 'payload'

type SommerfreizeitUserRecord = {
  id: string
  email: string
}

type BetterAuthPayload = Payload & {
  betterAuth?: {
    api: {
      createUser: (args: {
        body: {
          email: string
          name: string
          data: {
            firstName: string
            lastName: string
            phone: string | null
            address: string | null
            postalCode: string | null
            city: string | null
            emailVerified: boolean
          }
        }
      }) => Promise<unknown>
    }
  }
}

export type SommerfreizeitUserInput = {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  address?: string | null
  postalCode?: string | null
  city?: string | null
}

export type SommerfreizeitUserLookupResult = {
  created: boolean
  user: SommerfreizeitUserRecord | null
}

export function normalizeSommerfreizeitEmail(email: string) {
  return email.trim().toLowerCase()
}

export function buildSommerfreizeitDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}

export async function findSommerfreizeitUserByEmail(
  payload: Payload,
  email: string,
): Promise<SommerfreizeitUserRecord | null> {
  const normalizedEmail = normalizeSommerfreizeitEmail(email)

  const existingUser = await payload.find({
    collection: 'sommerfreizeitUsers',
    where: {
      email: {
        equals: normalizedEmail,
      },
    },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  const user = existingUser.docs[0]

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
  }
}

export async function ensureSommerfreizeitUser(
  payload: Payload,
  input: SommerfreizeitUserInput,
): Promise<SommerfreizeitUserLookupResult> {
  const existingUser = await findSommerfreizeitUserByEmail(payload, input.email)

  if (existingUser) {
    return {
      created: false,
      user: existingUser,
    }
  }

  const payloadWithBetterAuth = payload as BetterAuthPayload
  const normalizedEmail = normalizeSommerfreizeitEmail(input.email)
  const createUser = payloadWithBetterAuth.betterAuth?.api.createUser
  const displayName = buildSommerfreizeitDisplayName(input.firstName, input.lastName)

  if (createUser) {
    await createUser({
      body: {
        email: normalizedEmail,
        name: displayName,
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone ?? null,
          address: input.address ?? null,
          postalCode: input.postalCode ?? null,
          city: input.city ?? null,
          emailVerified: false,
        },
      },
    })
  } else {
    await payload.create({
      collection: 'sommerfreizeitUsers',
      data: {
        email: normalizedEmail,
        firstName: input.firstName,
        lastName: input.lastName,
        name: displayName,
        phone: input.phone ?? null,
        address: input.address ?? null,
        postalCode: input.postalCode ?? null,
        city: input.city ?? null,
        emailVerified: false,
      },
      depth: 0,
    })
  }

  const createdUser = await findSommerfreizeitUserByEmail(payload, normalizedEmail)

  return {
    created: true,
    user: createdUser,
  }
}