import { signal, computed } from 'alien-signals';

export { signal, computed, effect } from 'alien-signals';

export type Signal<T> = ReturnType<typeof signal<T>>;

export type Computed<T> = ReturnType<typeof computed<T>>;
