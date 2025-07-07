type WatchCallback<T> = (value: T) => void;

export type StateProxy<T extends object> = T & {
  $on: (
    keys: keyof T | (keyof T)[],
    callback: WatchCallback<T>,
    immediate?: boolean,
  ) => void;
  $off: (keys: keyof T | (keyof T)[], callback: WatchCallback<T>) => void;
};

export function proxyState<T extends object>(state: T): StateProxy<T> {
  const watchers = new Map<keyof T, Set<WatchCallback<T>>>();

  const proxy: StateProxy<T> = new Proxy(state, {
    set(target, key: string, value) {
      Reflect.set(target, key, value);

      if (!key.startsWith('$')) {
        watchers.get(key as keyof T)?.forEach((cb) => cb({ ...state }));
      }

      return true;
    },
  }) as StateProxy<T>;

  proxy.$on = (
    keys: keyof T | (keyof T)[],
    callback: WatchCallback<T>,
    immediate = true,
  ) => {
    if (immediate) {
      callback({ ...state });
    }

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    keys.forEach((key) => {
      if (!watchers.has(key)) {
        watchers.set(key, new Set());
      }
      watchers.get(key)?.add(callback as WatchCallback<T>);
    });
  };

  proxy.$off = (keys: keyof T | (keyof T)[], callback: WatchCallback<T>) => {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    keys.forEach((key) => {
      watchers.get(key)?.delete(callback as WatchCallback<T>);
    });
  };

  return proxy;
}
