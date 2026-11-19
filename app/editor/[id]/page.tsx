import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { WidgetEditor } from "@/components/editor/WidgetEditor";
import { createClient } from "@/lib/supabase/server";
import type { WidgetData, WidgetType } from "@/lib/widgets";

export const metadata: Metadata = {
  title: "Widget editor",
};

const widgetTypes = new Set<WidgetType>(["clock", "countdown", "quote", "progress", "pomodoro"]);

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/editor/${id}`);

  let initialWidget: WidgetData | null = null;
  if (id !== "new") {
    const { data } = await supabase
      .from("widgets")
      .select("id,title,type,theme_mode,font_family,config,created_at,updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) notFound();
    initialWidget = data as WidgetData;
  }

  const requestedType = query.type as WidgetType;
  const initialType = widgetTypes.has(requestedType) ? requestedType : "clock";
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  return (
    <div className="editor-page">
      <div className="editor-logo">
        <Logo href="/dashboard" />
      </div>
      <WidgetEditor
        initialWidget={initialWidget}
        initialType={initialType}
        siteOrigin={siteOrigin.replace(/\/$/, "")}
      />
    </div>
  );
}
