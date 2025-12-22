import type { User } from '@/payload-types'

export const rest = async (
  url: string,
  args?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  options?: RequestInit,
): Promise<null | undefined | User> => {
  const method = options?.method || 'POST'

  try {
    const res = await fetch(url, {
      method,
      ...(method === 'POST' ? { body: JSON.stringify(args) } : {}),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const data = await res.json()
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].message)
      }
      throw new Error(data.message || 'Request failed')
    }

    // Handle empty response (e.g., from logout)
    const text = await res.text()
    if (!text || text.trim() === '') {
      return null
    }

    const data = JSON.parse(text)

    // Handle both error response formats
    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    // Return user from the response
    return data.user || data
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw e
    }
    throw new Error(String(e))
  }
}
