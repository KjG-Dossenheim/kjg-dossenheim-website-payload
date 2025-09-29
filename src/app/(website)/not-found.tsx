import Link from 'next/link'
import type { Metadata } from 'next'
import Aurora from '@/components/Aurora'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full">
        <Aurora />
      </div>
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle>404 - Seite nicht gefunden</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Die von Ihnen gesuchte Seite existiert nicht.</p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/">Startseite</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
