import { parseDate, type DateValue } from '@internationalized/date'

/** A date as "YYYY-MM-DD", the way forms and APIs pass them, to the calendar's own value and back. */
export const toDateValue = (iso: string | undefined): DateValue | undefined => {
  if (!iso) return undefined
  try {
    return parseDate(iso)
  } catch {
    return undefined
  }
}
export const toIso = (value: DateValue | undefined) => value?.toString()
