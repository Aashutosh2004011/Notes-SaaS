// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for health check and auth routes
  if (path.startsWith('/api/health') || path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Check for API routes
  if (path.startsWith('/api')) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
      const decoded = await verifyToken(token) // Now async!
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('user-id', decoded.userId)
      requestHeaders.set('tenant-id', decoded.tenantId)
      requestHeaders.set('user-role', decoded.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.log('❌ Token verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/notes/:path*'],
}