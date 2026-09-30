import type { InjectionKey, Ref } from 'vue'

/** Whether the thread has shown its first messages, after which new answers come in. */
export const ChatThreadReadyKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('ChatThreadReady')

/**
 * What a message shares with its steps (ChatTool). Each step counts itself in, so the message stops
 * saying it is thinking: a slot filled in mid-answer does not re-render the message on its own.
 * The first step takes over the thinking line, its words morphing from what that line said.
 */
export interface ChatMessageContext {
  steps: Ref<number>
  /** The thinking line's words while it shows. */
  thinking: Readonly<Ref<string | undefined>>
}

export const ChatMessageKey: InjectionKey<ChatMessageContext> = Symbol('ChatMessage')
