import { sentry } from '@/sentry-server'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/react-router'
import { isbot } from 'isbot'
import { PassThrough } from 'node:stream'
import { createElement } from 'react'
import {
  renderToPipeableStream,
  type RenderToPipeableStreamOptions,
  type RenderToReadableStreamOptions,
} from 'react-dom/server'
import {
  ServerRouter,
  type AppLoadContext,
  type EntryContext,
  type HandleErrorFunction,
} from 'react-router'

export const streamTimeout = 30_000

export const handleError: HandleErrorFunction = (error, { request }) => {
  // React Router may abort some interrupted requests, report those
  if (!request.signal.aborted) {
    Sentry.captureException(error)
    // make sure to still log the error so you can see it
    console.error(error)
  }
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext?: AppLoadContext,
): Promise<Response> {
  const response = await handleRequestVercel(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext,
  )

  return response
}

export type RenderOptions = {
  [K in keyof RenderToReadableStreamOptions &
    keyof RenderToPipeableStreamOptions]?: RenderToReadableStreamOptions[K]
}

function handleRequestVercel(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext?: AppLoadContext,
  options?: RenderOptions,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const userAgent = request.headers.get('user-agent')

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? 'onAllReady'
        : 'onShellReady'

    const { pipe, abort } = renderToPipeableStream(
      createElement(ServerRouter, {
        context: routerContext,
        url: request.url,
        nonce: options?.nonce,
      }),
      {
        ...options,

        [readyOption]() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          sentry.captureException(error)

          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500

          sentry.captureException(error)

          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000)
  })
}
