import { de } from 'react-day-picker/locale'

import React, { useState, useEffect } from 'react'

import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DatePickerInputProps = {
  id: string
  name: string
  value: string | undefined
  onChange: (value: string) => void
  onBlur: () => void
  inputRef: React.Ref<HTMLInputElement>
  invalid: boolean
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DatePickerInput({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  invalid,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined)

  // Sync date state when value prop changes
  useEffect(() => {
    if (value) {
      const parsedDate = new Date(value)
      if (isValidDate(parsedDate)) {
        setDate(parsedDate)
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  return (
    <div className="relative flex gap-2">
      <style>
        {`
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-calendar-picker-indicator {
            display: none;
            -webkit-appearance: none;
          }
        `}
      </style>
      <Input
        id={id}
        ref={inputRef}
        value={value || ''}
        autoComplete="bday"
        inputMode="numeric"
        onChange={(e) => {
          const newValue = e.target.value
          onChange(newValue)
          if (newValue) {
            const parsedDate = new Date(newValue)
            if (isValidDate(parsedDate)) {
              setDate(parsedDate)
            }
          } else {
            setDate(undefined)
          }
        }}
        onBlur={onBlur}
        onKeyDown={(event) => {
          // Open calendar with keyboard shortcuts
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
          // Close calendar with Escape
          if (event.key === 'Escape' && open) {
            event.preventDefault()
            setOpen(false)
          }
        }}
        aria-invalid={invalid}
        type="date"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            onKeyDown={(event) => {
              // Open calendar with Enter or Space
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            }}
          >
            <CalendarIcon />
            <span className="sr-only">Datum auswählen (Enter oder Leertaste zum Öffnen)</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            locale={de}
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate)
                onChange(format(selectedDate, 'yyyy-MM-dd'))
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
