import { NextResponse } from "next/server";

const backendUrl = String(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

export async function GET(request: Request) {
  if (!backendUrl) return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const result = await fetch(`${backendUrl}/api/public/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { cache: "no-store" });
  return new NextResponse(await result.text(), {
    status: result.status,
    headers: { "content-type": result.headers.get("content-type") || "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  const body = await request.text();
  const result = await fetch(`${backendUrl}/api/public/newsletter/unsubscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });
  return new NextResponse(await result.text(), { status: result.status });
}
