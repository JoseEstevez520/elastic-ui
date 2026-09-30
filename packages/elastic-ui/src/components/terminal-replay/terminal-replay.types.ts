/** One command in a TerminalReplay. */
export interface TerminalReplayEntry {
  /** Said before the command, as a shell comment (`# …`): what it is for. */
  comment?: string
  command: string
  /** What it printed. Lines starting with ✔ or ✓ read as passed, ✖, ✗ or "Error" as failed. */
  output?: string
  /** How long it runs before printing, in milliseconds. */
  duration?: number
}
