'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type ChildData = {
  registrationId: string
  firstName: string
  lastName: string
  age?: number | null
  gender?: 'male' | 'female' | 'diverse' | 'noInfo'
  dateOfBirth: string
  healthInfo?: string | null
  pickupInfo?: 'pickedUp' | 'goesAlone'
  photoConsent?: boolean | null
  parentName: string
  parentEmail: string
  parentPhone: string
  isWaitlist: boolean | null
}

const GENDER_LABELS = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
}

const PICKUP_LABELS = {
  pickedUp: 'Wird abgeholt',
  goesAlone: 'Geht alleine nach Hause',
}

export const columns: ColumnDef<ChildData>[] = [
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nachname
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vorname
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'age',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Alter
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const age = row.getValue('age') as number | null
      return age ? `${age} Jahre` : '-'
    },
  },
  {
    accessorKey: 'gender',
    header: 'Geschlecht',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as keyof typeof GENDER_LABELS | undefined
      return gender ? GENDER_LABELS[gender] : '-'
    },
  },
  {
    accessorKey: 'pickupInfo',
    header: 'Abholung',
    cell: ({ row }) => {
      const pickupInfo = row.getValue('pickupInfo') as keyof typeof PICKUP_LABELS | undefined
      return pickupInfo ? PICKUP_LABELS[pickupInfo] : '-'
    },
  },
  {
    accessorKey: 'photoConsent',
    header: 'Foto',
    cell: ({ row }) => {
      const consent = row.getValue('photoConsent') as boolean | null
      if (consent === null || consent === undefined) return '-'
      return consent ? (
        <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">
          Ja
        </Badge>
      ) : (
        <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800">
          Nein
        </Badge>
      )
    },
  },
  {
    accessorKey: 'healthInfo',
    header: 'Gesundheitsinfo',
    cell: ({ row }) => {
      const healthInfo = row.getValue('healthInfo') as string | null
      if (!healthInfo) return '-'
      return healthInfo
    },
  },
]
