import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = body?.token;
  if (!token) return NextResponse.json({ error: "token missing" }, { status: 400 });

  const n8nUrl = process.env.N8N_CONTRACT_APPROVE_URL;
  const n8nKey = process.env.N8N_SHARED_SECRET;

  if (!n8nUrl || !n8nKey) {
    return NextResponse.json({ error: "server config missing" }, { status: 500 });
  }

  const res = await fetch(n8nUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shared-secret": n8nKey,
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) return new NextResponse(text || "n8n error", { status: res.status });

  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
