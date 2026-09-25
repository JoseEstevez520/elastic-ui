import type { InjectionKey, Ref } from 'vue'

/** Whether the thread has shown its first messages, after which new answers come in. */
export const ChatThreadReadyKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('ChatThreadReady')

/**
 * A message's steps (ChatTool) tell it they are there, so it stops saying it is thinking: a slot
 * filled in mid-answer does not re-render the message on its own.
 */
export const ChatMessageStepsKey: InjectionKey<Ref<number>> = Symbol('ChatMessageSteps')
