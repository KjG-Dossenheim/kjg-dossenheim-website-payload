'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/client'
import { Loader2 } from 'lucide-react'

export function LogoutClient() {
  const router = useRouter()

  useEffect(() => {
    async function performLogout() {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/sommerfreizeit?loggedOut=true')
          },
        },
      })
    }
    performLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mb-4 inline-block h-8 w-8 animate-spin text-gray-600" />
        <p className="text-gray-600">Du wirst abgemeldet...</p>
      </div>
    </div>
  )
}
