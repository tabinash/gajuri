import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Basic shape validation (lightweight, replace with zod/yup if desired)
    const required = ["name", "email", "password", "accountType", "dob", "district", "palika", "ward"] as const;
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === "") {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }
    // Simulate sending OTP (e.g., email or SMS)
    await new Promise((r) => setTimeout(r, 400));
    // In real app, generate and store OTP server-side (session/db) tied to email/phone
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
