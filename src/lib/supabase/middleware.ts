import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_PATHS } from "@/config/publicPaths";

// Refreshes the Supabase auth session on every request and redirects
// unauthenticated visitors away from anything under the village.
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Carries the user id middleware has already verified via auth.getUser()
// through to Server Components (see requireProfile()), so pages don't need
// their own redundant auth.getUser() round trip to Supabase Auth on every
// navigation. Set/cleared unconditionally below on every request before it
// reaches any page, so a client sending this header itself can't spoof it —
// whatever middleware decides here always overwrites it.
export const VERIFIED_USER_HEADER = "x-verified-user-id";

export async function updateSession(request: NextRequest) {
  let cookiesToApply: {
    name: string;
    value: string;
    options: CookieOptions;
  }[] = [];

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
            request.cookies.set(name, value),
          );
          cookiesToApply = cookiesToSet;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    cookiesToApply.forEach(({ name, value, options }) =>
      redirectResponse.cookies.set(name, value, options),
    );
    return redirectResponse;
  }

  if (user) {
    request.headers.set(VERIFIED_USER_HEADER, user.id);
  } else {
    request.headers.delete(VERIFIED_USER_HEADER);
  }

  const response = NextResponse.next({ request });
  // Belt-and-suspenders alongside robots.ts's Disallow: a crawler that
  // discovers a private URL via an external link still gets told not to
  // index it, even though robots.txt alone can't guarantee that.
  if (!isPublic) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  cookiesToApply.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );

  return response;
}
