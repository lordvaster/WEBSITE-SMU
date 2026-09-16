import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleForPrefix: { prefix: string; role: string }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/dashboard/guru", role: "guru" },
  { prefix: "/dashboard/siswa", role: "siswa" },
  { prefix: "/dashboard/orang-tua", role: "orang_tua" },
];

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    const match = roleForPrefix.find((r) => pathname.startsWith(r.prefix));
    if (match && role !== match.role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
