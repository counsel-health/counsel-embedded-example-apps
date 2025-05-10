/**
 * A type that represents a successful result with data or an error.
 * Comes from functional programming. Use with below safePromise to handle errors.
 */
export type SafeResult<T, E = Error> = [T, null] | [null, E];

/**
 * Wraps a promise in a try/catch and returns a tuple of [data, error].
 * Comes from: https://gist.github.com/t3dotgg/a486c4ae66d32bf17c09c73609dacc5b?permalink_comment_id=5506786
 * @returns [data, error]
 */
export async function safePromise<T, E = Error>(promise: Promise<T>): Promise<SafeResult<T, E>> {
  return promise.then((data) => [data, null] as [T, null]).catch((error) => [null, error as E]);
}
