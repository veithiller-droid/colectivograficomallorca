import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = String(
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");

  if (!backendUrl) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  }

  const formData = await request.formData();
  const result = await fetch(`${backendUrl}/api/public/framing-requests`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  return new NextResponse(await result.text(), {
    status: result.status,
    headers: {
      "content-type": result.headers.get("content-type") || "application/json",
    },
  });
}
