/** Lab: what both week sketches share, the days' names and the line that sums them up. */

/** The week's days in order, from the locale: 1 is Monday, 7 Sunday. */
export function weekDays(locale: string, weekStartsOn: 1 | 7) {
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  // 2024-01-01 was a Monday: a fixed week to take the names from.
  return Array.from({ length: 7 }, (_, i) => ((weekStartsOn - 1 + i) % 7) + 1).map((day) => {
    const date = new Date(2024, 0, day)
    return { day, long: long.format(date), short: short.format(date).replace('.', ''), narrow: narrow.format(date) }
  })
}

/** "Every day", "Weekdays", "Weekends", or the days, runs of three or more joined: "Mon–Thu, Sat". */
export function summaryOf(days: number[], week: ReturnType<typeof weekDays>) {
  const on = new Set(days)
  if (!on.size) return 'No days'
  if (on.size === 7) return 'Every day'
  const is = (set: number[]) => on.size === set.length && set.every((d) => on.has(d))
  if (is([1, 2, 3, 4, 5])) return 'Weekdays'
  if (is([6, 7])) return 'Weekends'
  const parts: string[] = []
  let run: typeof week = []
  const close = () => {
    if (run.length >= 3) parts.push(`${run[0]!.short}–${run.at(-1)!.short}`)
    else parts.push(...run.map((d) => d.short))
    run = []
  }
  for (const d of week) on.has(d.day) ? run.push(d) : close()
  close()
  return parts.join(', ')
}
