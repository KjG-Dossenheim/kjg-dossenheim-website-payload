import { de } from 'react-day-picker/locale'

import React, { useState } from 'react'

import { CalendarIcon } from 'lucide-react'
import { parse, formatDate } from 'date-fns'

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

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        ref={inputRef}
        value={value || ''}
        autoComplete="bday"
        inputMode="numeric"
        placeholder="TT.MM.JJJJ"
        onChange={(e) => {
          const inputValue = e.target.value
          onChange(inputValue)
          // Try to parse the date in German format (d.MM.yyyy)
          const parsedDate = parse(inputValue, 'd.MM.yyyy', new Date())
          if (isValidDate(parsedDate)) {
            setDate(parsedDate)
          }
        }}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        aria-invalid={invalid}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon />
            <span className="sr-only">Datum auswählen</span>
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
                onChange(formatDate(selectedDate, 'd.MM.yyyy'))
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
