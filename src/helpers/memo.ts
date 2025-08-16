// export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
//   const cache = new Map<string, ReturnType<T>>();
//
//   const memoized = ((...args: Parameters<T>): ReturnType<T> => {
//     const key = JSON.stringify(args); // Simple key — adjust for complex objects if needed
//     if (cache.has(key)) {
//       return cache.get(key)!;
//     }
//     const result = fn(...args) as ReturnType<T>;
//     cache.set(key, result);
//     return result;
//   }) as T;
//
//   return memoized as unknown as T;
// }

// memoize.ts
export function memoize<F extends (...args: unknown[]) => unknown>(fn: F): F;
export function memoize(fn: unknown) {
  const f = fn as (...args: unknown[]) => unknown;
  const cache = new Map<string, unknown>();

  function memoized(this: unknown, ...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = f.apply(this, args);
    cache.set(key, result);
    return result;
  }

  // cast the runtime wrapper back to the original function's type
  return memoized as unknown as typeof fn;
}

