import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateWidgetInput } from "@/lib/widgets";

const publicColumns = "id,title,type,theme_mode,font_family,config,created_at,updated_at";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: "You need to sign in first." }, { status: 401 });
  }
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: "Widget not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateWidgetInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: parsed.errors }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("widgets")
    .update(parsed.value)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(publicColumns)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "The widget could not be saved. Please try again." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Widget not found." }, { status: 404 });
  }

  return NextResponse.json({ widget: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: "You need to sign in first." }, { status: 401 });
  }
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: "Widget not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("widgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "The widget could not be deleted. Please try again." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Widget not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
