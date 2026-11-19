import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateWidgetInput } from "@/lib/widgets";

const publicColumns = "id,title,type,theme_mode,font_family,config,created_at,updated_at";

export async function POST(request: Request) {
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

  const parsed = validateWidgetInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: parsed.errors }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("widgets")
    .insert({ ...parsed.value, user_id: user.id })
    .select(publicColumns)
    .single();

  if (error) {
    return NextResponse.json({ error: "The widget could not be saved. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ widget: data }, { status: 201 });
}
