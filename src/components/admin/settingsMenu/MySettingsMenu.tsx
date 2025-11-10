'use client'
import { PopupList } from '@payloadcms/ui'

export function MySettingsMenu() {
  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={() => window.open('/admin/settings')}>
        Einstellungen
      </PopupList.Button>
      <PopupList.Button onClick={() => window.open('/admin/email-preview')}>
        Email Vorschau
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}

export default MySettingsMenu
