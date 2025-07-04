import type { Connect } from 'vite'

/**
 * CORS Middleware for VNet RPC Endpoints
 *
 * PURPOSE: This middleware allows any application to call the VNet RPC endpoints
 * by setting permissive CORS headers. The goal is to make the endpoint as accessible
 * as possible for arbitrary POST requests from any origin.
 *
 * IMPORTANT: Any changes to CORS headers in this middleware must also be applied
 * to the production server configuration in vercel.json. This middleware only
 * affects the local development server.
 *
 * CORS Headers Explained:
 * - Access-Control-Allow-Origin: '*' - Allows requests from any domain
 * - Access-Control-Allow-Methods: 'POST, OPTIONS' - Allows POST requests and preflight OPTIONS
 * - Access-Control-Allow-Headers: Comprehensive list of common headers to be as permissive as possible
 * - Access-Control-Max-Age: '86400' - Caches preflight results for 24 hours (performance optimization)
 * - Access-Control-Allow-Credentials: 'true' - Allows credentials if needed
 */
export function corsMiddleware(): Connect.HandleFunction {
  return (req, res, next) => {
    // Only apply CORS to /vnet/rpc/ routes
    if (req.url?.startsWith('/vnet/rpc/')) {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Accept-Language, Cache-Control, Connection, Cookie, DNT, Host, If-Modified-Since, If-None-Match, Origin, Pragma, Referer, Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site, User-Agent, X-Forwarded-For, X-Forwarded-Proto, X-Real-IP, X-Requested-With',
      )
      res.setHeader('Access-Control-Max-Age', '86400')
      res.setHeader('Access-Control-Allow-Credentials', 'true')

      // Handle OPTIONS requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }
    }

    next()
  }
}
