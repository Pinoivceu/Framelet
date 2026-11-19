import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WidgetRenderer } from "@/components/widget/WidgetRenderer";
import { createClient } from "@/lib/supabase/server";
import type { WidgetData } from "@/lib/widgets";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("widgets")
    .select("id,title,type,theme_mode,font_family,config")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <main className="embed-page">
      <WidgetRenderer widget={data as WidgetData} />
    </main>
  );
}
