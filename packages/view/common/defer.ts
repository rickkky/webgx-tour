export function createDefer<T>() {
  let resolve!: (value: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: (reason: any) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
