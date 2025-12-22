'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type AnmeldungData = {
  id: string
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'diverse'
  class: string | null
  city: string
  userEmail: string | null
  userPhone: string | null
  createdAt: string
}

export const columns: ColumnDef<AnmeldungData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return <span className="font-medium">{name}</span>
    },
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Geburtsdatum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue('dateOfBirth') as string
      const date = new Date(dateStr)
      const dateFormatted = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      return dateFormatted
    },
  },
  {
    accessorKey: 'gender',
    header: 'Geschlecht',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as 'male' | 'female' | 'diverse'
      const variantMap = {
        male: 'default',
        female: 'secondary',
        diverse: 'outline',
      } as const
      const labelMap = {
        male: 'Männlich',
        female: 'Weiblich',
        diverse: 'Divers',
      }
      return <Badge variant={variantMap[gender]}>{labelMap[gender]}</Badge>
    },
  },
  {
    accessorKey: 'class',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Klasse
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const classValue = row.getValue('class') as string | null
      return classValue ? `${classValue}. Klasse` : '-'
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue('class') as string | null
      const b = rowB.getValue('class') as string | null
      if (!a) return 1
      if (!b) return -1
      return parseInt(a) - parseInt(b)
    },
  },
  {
    accessorKey: 'city',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ort
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'userEmail',
    header: 'Kontakt',
    cell: ({ row }) => {
      const email = row.getValue('userEmail') as string | null
      const phone = row.original.userPhone

      if (!email && !phone) return '-'

      const emailDisplay = email || '-'
      const truncated =
        emailDisplay.length > 30 ? emailDisplay.substring(0, 30) + '...' : emailDisplay

      return (
        <div className="flex flex-col">
          {email && email.length > 30 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{truncated}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">{email}</TooltipContent>
            </Tooltip>
          ) : (
            <span>{truncated}</span>
          )}
          {phone && <span className="text-xs text-muted-foreground">{phone}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Erstellt am
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string
      const date = new Date(dateStr)
      const dateFormatted = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const timeFormatted = date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `${dateFormatted} ${timeFormatted}`
    },
  },
]
