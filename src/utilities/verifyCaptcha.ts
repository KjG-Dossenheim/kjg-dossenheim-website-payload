type VerificationResponse = {
  success: boolean
}

export async function verifyCaptchaToken(token: string): Promise<boolean> {
  if (!token) return false

  const captchaUrl = process.env.NEXT_PUBLIC_CAPTCHA_URL || 'https://captcha.gurl.eu.org/api/'
  const endpoint = `${captchaUrl}validate`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, keepToken: true }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Captcha verification failed with status:', response.status)
      return false
    }

    const result = (await response.json()) as VerificationResponse
    return Boolean(result?.success)
  } catch (error) {
    console.error('Captcha verification error:', error)
    return false
  }
}
