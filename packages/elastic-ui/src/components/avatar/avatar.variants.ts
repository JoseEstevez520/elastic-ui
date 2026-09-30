import { cva, type VariantProps } from 'class-variance-authority'

/**
 * A round photo, or with no photo a person drawn on the surface tone: never initials, which say
 * little and read as filler. Colours read `--avatar-*` first.
 */
export const avatarVariants = /* @__PURE__ */ cva(
  'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[color:var(--avatar-bg,var(--color-surface))] align-middle text-[color:var(--avatar-fg,var(--color-fg-muted))]',
  {
    variants: {
      size: {
        sm: 'size-6',
        md: 'size-8',
        lg: 'size-10',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

/**
 * How far a group's avatars overlap at rest, and the gap they open to when the group is hovered
 * or focused. Only the margin moves, on the library's curve, so the row simply opens out.
 */
export const avatarGroupItemVariants = /* @__PURE__ */ cva(
  'not-first:transition-[margin] not-first:duration-[350ms] not-first:ease-emphasized motion-reduce:transition-none',
  {
    variants: {
      size: {
        sm: 'not-first:-ms-1.5 group-hover/avatars:not-first:ms-1 group-focus-within/avatars:not-first:ms-1',
        md: 'not-first:-ms-2 group-hover/avatars:not-first:ms-1 group-focus-within/avatars:not-first:ms-1',
        lg: 'not-first:-ms-3 group-hover/avatars:not-first:ms-1.5 group-focus-within/avatars:not-first:ms-1.5',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type AvatarVariants = VariantProps<typeof avatarVariants>
export type AvatarSize = NonNullable<AvatarVariants['size']>
