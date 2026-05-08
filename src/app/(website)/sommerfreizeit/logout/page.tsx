import { LogoutClient } from './LogoutClient'

export const metadata = {
  title: 'Abmelden',
  robots: { index: false, follow: false },
}

export default function LogoutPage() {
  return <LogoutClient />
}
