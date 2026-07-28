'use client'

import React from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QRCode } from '@/components/ui/shadcn-io/qr-code'

export function QRDialog({ eventId, siteUrl }: { eventId: string; siteUrl: string }) {
  return (
    <Dialog>
      <DialogTrigger
        render={() => (
          <Button variant="outline" className="ml-2">
            <QrCode />
            QR Code
          </Button>
        )}
      />
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>Scanne den QR-Code</DialogTitle>
        </DialogHeader>
        <div>
          <QRCode data={`${siteUrl}/knallbonbon/anmelden?event=${eventId}`} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
