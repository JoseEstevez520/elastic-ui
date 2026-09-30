import type { Component } from 'vue'

/** What you asked the agent. */
export interface AgentReplayPrompt {
  kind: 'prompt'
  text: string
  /** What to notice at this point, shown beside the session. */
  note?: string
}

/** Something the agent does on its way: read a file, search, run a command, edit. */
export interface AgentReplayStep {
  kind: 'step'
  /** While it runs: "Reading server.js". */
  running: string
  /** Once done: "Read server.js". */
  done: string
  icon?: Component
  /** What it printed or found, shown as code when the step is opened. */
  output?: string
  /** The edit it made, shown as a CodeDiff, opened on its own once done. */
  diff?: { file?: string; before: string; after: string }
  /** How long it runs, in milliseconds. */
  duration?: number
  /**
   * Whether the agent may do it: `ask-allow` and `ask-deny` stop to ask you, showing Allow and
   * Deny (the script's answer is picked after a moment, or yours if you click first); `deny` is
   * refused outright. Refused, the step ends in `done`, which should say so.
   */
  permission?: 'ask-allow' | 'ask-deny' | 'deny'
  /** While it waits for you: "Wants to edit server.js". */
  asking?: string
  /** A subagent's own session, played inside the step while it runs; only its answer comes back. */
  session?: Array<AgentReplayStep | AgentReplayAnswer>
  note?: string
}

/** The agent's answer, flowing in as the chat's wave. */
export interface AgentReplayAnswer {
  kind: 'answer'
  text: string
  /** Code the answer hands you, shown under it: what a model alone gives you to paste. */
  code?: { file?: string; code: string }
  note?: string
}

export type AgentReplayEvent = AgentReplayPrompt | AgentReplayStep | AgentReplayAnswer
