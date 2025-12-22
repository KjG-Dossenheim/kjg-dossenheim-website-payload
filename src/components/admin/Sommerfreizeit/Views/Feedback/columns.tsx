'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type FeedbackData = {
  id: string
  age: number
  rating: number
  comments?: string | null
  createdAt: string
}

export const columns: ColumnDef<FeedbackData>[] = [
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
      const age = row.getValue('age') as number
      return `${age} Jahre`
    },
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Bewertung
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      return '⭐'.repeat(rating)
    },
  },
  {
    accessorKey: 'comments',
    header: 'Kommentare',
    cell: ({ row }) => {
      const comments = row.getValue('comments') as string | null
      if (!comments) return '-'

      const truncated = comments.length > 50 ? comments.substring(0, 50) + '...' : comments
      const isTruncated = comments.length > 50

      if (isTruncated) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{truncated}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-md whitespace-pre-wrap">
              {comments}
            </TooltipContent>
          </Tooltip>
        )
      }

      return truncated
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
