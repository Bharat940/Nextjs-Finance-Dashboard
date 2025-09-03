import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
    }

    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/invoices") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/transactions") ||
        pathname.startsWith("/wallets") ||
        pathname.startsWith("/create-wallet")
    ) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/register",
        "/dashboard/:path*",
        "/invoices/:path*",
        "/settings/:path*",
        "/transactions/:path*",
        "/wallets/:path*",
        "/create-wallet",
    ],
};
