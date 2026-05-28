import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/adapt", "/create", "/result", "/interview", "/resume", "/tokens"];
const authPaths = ["/auth"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip Supabase entirely for public pages (landing, static assets)
  // Match exact or path segment (e.g. "/adapt" but NOT "/adaptaciya-resume")
  const matchSegment = (paths: string[]) =>
    paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProtected = matchSegment(protectedPaths);
  const isAuthPage = matchSegment(authPaths);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request });
  }

  // Only create Supabase client for pages that need auth check
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
