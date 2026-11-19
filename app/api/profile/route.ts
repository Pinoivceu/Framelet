import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to sign in first." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const fullName = typeof raw.full_name === "string" ? raw.full_name.trim().slice(0, 80) : "";

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", user.id)
    .select("id,email,full_name,avatar_url,created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Your profile could not be updated." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}
