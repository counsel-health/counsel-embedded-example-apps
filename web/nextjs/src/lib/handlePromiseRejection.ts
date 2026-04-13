/**
 * Runs a fire-and-forget async task and routes rejections to `onReject`.
 * Use instead of `void (async () => { ... })()` so failures are not unhandled.
 */
export function handlePromiseRejection<T>(
  operation: () => Promise<T>,
  onReject: (reason: unknown) => void,
): void {
  void operation().catch(onReject);
}
