import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Skip if already on mobile path
  if (pathname.startsWith('/m')) {
    return NextResponse.next()
  }

  // TODO: REPLACE THIS SECTION WHEN DEPLOYING TO PRODUCTION
  // For localhost testing, you can manually access mobile version at:
  // http://localhost:3000/m

  // PRODUCTION CONFIGURATION (uncomment when deploying to m.gajuri.com):
  /*
  if (hostname.startsWith('m.')) {
    const url = request.nextUrl.clone()
    // Rewrite to mobile version: m.gajuri.com/ -> /m/
    url.pathname = `/m${pathname}`
    return NextResponse.rewrite(url)
  }
  */

  // LOCALHOST CONFIGURATION (for testing with hosts file):
  // Add this to your hosts file: 127.0.0.1 m.localhost
  // Then access: http://m.localhost:3000
  if (hostname.startsWith('m.localhost')) {
    const url = request.nextUrl.clone()
    url.pathname = `/m${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// Configure which routes should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
