import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/batches', '/finances', '/settings', '/orders', '/reports'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register');

  const isProtected = protectedPrefixes.some((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
