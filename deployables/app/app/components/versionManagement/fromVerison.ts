import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { compare } from 'compare-versions'

export async function fromVersion<T>(
  version: string,
  callback: () => T,
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
  }
}
