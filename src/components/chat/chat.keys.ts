import type { InjectionKey, Ref } from 'vue'

/** Whether the thread has shown its first messages, after which new answers come in. */
export const ChatThreadReadyKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('ChatThreadReady')
