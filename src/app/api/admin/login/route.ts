import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken, verifyCredentials } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");

  if (!verifyCredentials(username, password)) {
    const url = new URL("/admin/login?error=1", request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = createSessionToken();
  const response = NextResponse.redirect(new URL("/admin/leads", request.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
