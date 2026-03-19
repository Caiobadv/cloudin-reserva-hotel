import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Reception dashboard - requires RECEPTION or ADMIN role
    if (pathname === '/reception') {
      if (
        token?.role !== 'RECEPTION' &&
        token?.role !== 'ADMIN'
      ) {
        return new Response('Access denied', { status: 403 });
      }
    }

    // Admin dashboard - requires ADMIN role
    if (pathname === '/admin') {
      if (token?.role !== 'ADMIN') {
        return new Response('Access denied', { status: 403 });
      }
    }

    return undefined;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes - always allow
        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname.startsWith('/api/auth/') ||
          pathname === '/api/rooms' ||
          pathname.startsWith('/api/rooms/')
        ) {
          return true;
        }

        // Protected routes - require authentication
        if (
          pathname === '/my-reservations' ||
          pathname.startsWith('/booking/') ||
          pathname.startsWith('/rooms/')
        ) {
          return !!token;
        }

        // Reception - requires RECEPTION or ADMIN
        if (pathname === '/reception') {
          return token?.role === 'RECEPTION' || token?.role === 'ADMIN';
        }

        // Admin - requires ADMIN
        if (pathname === '/admin') {
          return token?.role === 'ADMIN';
        }

        // Default allow
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/my-reservations',
    '/booking/:path*',
    '/rooms/:path*',
    '/reception',
    '/admin',
  ],
};
