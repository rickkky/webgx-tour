import { computed, signal } from 'alien-signals';

export { computed, effect, signal } from 'alien-signals';

export type Signal<T> = ReturnType<typeof signal<T>>;

export type Computed<T> = ReturnType<typeof computed<T>>;
