import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { compare } from 'compare-versions'

/**
 * Runs code when a certain minimum version of the browser extension is present
 *
 * @param version Minimum version of the browser extension.
 * @param callback Code to execute when the version range matches.
 * @param fallback Optional fallback to run if the version does not match.
 *
 * @returns Promise<T | void> the result of the callback
 */
export async function fromVersion<T>(
  version: string,
  callback: () => T,
  fallback?: () => void,
): Promise<T | void> {
  const { promise, resolve } = Promise.withResolvers<string>()

  companionRequest(
    { type: CompanionAppMessageType.REQUEST_VERSION },
    ({ version }) => resolve(version),
  )

  const currentVersion = await promise

  if (process.env.NODE_ENV === 'development') {
    return callback()
  }

  if (compare(currentVersion, version, '>=')) {
    return callback()
  } else {
    if (fallback != null) {
      return fallback()
    }
  }
}
