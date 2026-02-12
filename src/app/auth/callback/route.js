// app/auth/callback/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Only handle if there's an OAuth code
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to home page with clean URL after successful auth
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // If no code, this wasn't an OAuth callback - return 404
  return new NextResponse('Not Found', { status: 404 });
}