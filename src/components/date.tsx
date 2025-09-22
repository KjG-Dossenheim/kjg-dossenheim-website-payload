import React from 'react'
import { parseISO, format } from 'date-fns'
import { de } from 'date-fns/locale'

interface DateComponentProps {
  dateString: string
  formatString: string
}

const DateComponent = React.memo(({ dateString, formatString }: DateComponentProps) => {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, formatString, { locale: de })}</time>
})

DateComponent.displayName = 'DateComponent'

export default DateComponent
