import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Clear cookies after successful login or sign-out
  cookies().delete("sb-access-token"); // Remove the access token cookie
  cookies().delete("sb-refresh-token"); // Remove the refresh token cookie
  cookies().delete("supabase.auth.token"); // In case there's any other token stored

  return NextResponse.redirect(requestUrl.origin);
}
