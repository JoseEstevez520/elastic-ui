import type { Component } from 'vue'
import type { LinkTo } from '../../utils/link'

/** One slot in the week: a class, a shift, a meeting. Times as "HH:MM". */
export interface TimetableEvent {
  /** Identifies it to `editable`'s create/move/resize/select events; itself if left out. */
  id?: string | number
  /** Which of `days`, from 0. */
  day: number
  start: string
  end: string
  title: string
  /** A second line under the title, such as the teacher. */
  detail?: string
  /** Its colour, shown as a soft tint with its title in it; the same for all of one subject. */
  color?: string
  /** Its page, through the app's router; or `href` for a plain link. */
  to?: LinkTo
  href?: string
}

/** A pause across every day, such as a break. */
export interface TimetableBreak {
  start: string
  end: string
  label: string
  icon?: Component
}
