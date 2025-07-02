type WatchCallback<T> = (value: T) => void;
type UnwatchFn = () => void;

interface WatchOptions {
  immediate?: boolean;
}

export function watchState<T extends object>(state: T) {
  const watchers = new Map<string, Set<WatchCallback<T[keyof T]>>>();

  const proxy = new Proxy(state, {
    set(target, property: string, value) {
      target[property as keyof T] = value;

      const propertyWatchers = watchers.get(property);
      if (propertyWatchers) {
        propertyWatchers.forEach((cb) => cb(value));
      }

      return true;
    },
  });

  function watch<K extends keyof T>(
    properties: K[],
    callback: WatchCallback<T[K]>,
    options?: WatchOptions,
  ): UnwatchFn {
    if (options?.immediate) {
      properties.forEach((prop) => {
        callback(proxy[prop]);
      });
    }

    properties.forEach((property) => {
      if (!watchers.has(property as string)) {
        watchers.set(property as string, new Set());
      }
      watchers
        .get(property as string)
        ?.add(callback as WatchCallback<T[keyof T]>);
    });

    return () => {
      properties.forEach((property) => {
        watchers
          .get(property as string)
          ?.delete(callback as WatchCallback<T[keyof T]>);
      });
    };
  }

  return watch;
}
