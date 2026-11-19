import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { WidgetCardActions } from "@/components/dashboard/WidgetCardActions";
import { createClient } from "@/lib/supabase/server";
import { WIDGET_TYPES, type FontFamily, type ThemeMode, type WidgetType } from "@/lib/widgets";

export const metadata: Metadata = {
  title: "Your widgets",
};

interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  theme_mode: ThemeMode;
  font_family: FontFamily;
  updated_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: widgetRows, error }] = await Promise.all([
    supabase.from("profiles").select("email,full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("widgets")
      .select("id,title,type,theme_mode,font_family,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const widgets = (widgetRows ?? []) as DashboardWidget[];
  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";
  const initial = displayName.slice(0, 1).toUpperCase();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`).replace(/\/$/, "");

  return (
    <main className="studio-page">
      <header className="studio-header">
        <Logo href="/dashboard" />
        <div className="studio-account">
          <Link className="account-chip" href="/dashboard/profile">
            <span className="avatar">{initial}</span>
            <span>{displayName}</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="quiet-button" type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <div className="studio-shell">
        <section className="dashboard-heading">
          <div>
            <p className="kicker">Widget collection</p>
            <h1>Good morning, {displayName}.</h1>
            <p>Make a small thing that does exactly one job.</p>
          </div>
          <div className="dashboard-count">
            <strong>{widgets.length}</strong>
            <span>{widgets.length === 1 ? "widget" : "widgets"}</span>
          </div>
        </section>

        <section className="template-strip" aria-labelledby="new-widget-heading">
          <div className="strip-heading">
            <h2 id="new-widget-heading">Start a new widget</h2>
            <span>All five are free</span>
          </div>
          <div className="template-links">
            {WIDGET_TYPES.map((widget, index) => (
              <Link
                className="template-link"
                href={`/editor/new?type=${widget.type}`}
                key={widget.type}
              >
                <span className="template-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{widget.label}</strong>
                <small>{widget.description}</small>
                <span className="template-plus" aria-hidden="true">+</span>
              </Link>
            ))}
          </div>
        </section>

        {error ? (
          <section className="dashboard-error" role="alert">
            <h2>Your widgets could not be loaded.</h2>
            <p>Refresh the page to try again. If it keeps happening, check the Supabase connection.</p>
          </section>
        ) : widgets.length === 0 ? (
          <section className="empty-dashboard">
            <span className="empty-frame" aria-hidden="true"><i /><i /><i /><i /></span>
            <h2>Nothing in the frame yet.</h2>
            <p>Choose a widget above. Your first one takes about a minute.</p>
            <Link className="button button-primary" href="/editor/new?type=clock">
              Create your first widget
            </Link>
          </section>
        ) : (
          <section className="widget-list-section" aria-labelledby="saved-widgets-heading">
            <div className="list-heading">
              <h2 id="saved-widgets-heading">Your widgets</h2>
              <span>Newest edit first</span>
            </div>
            <div className="widget-list">
              {widgets.map((widget) => {
                const label = WIDGET_TYPES.find((item) => item.type === widget.type)?.label ?? "Widget";
                const updated = new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(widget.updated_at));
                return (
                  <article className="widget-list-row" key={widget.id}>
                    <div className={`type-tile type-${widget.type}`} aria-hidden="true">
                      {label.slice(0, 1)}
                    </div>
                    <div className="widget-row-copy">
                      <h3>{widget.title}</h3>
                      <p>{label} · {widget.theme_mode} · {widget.font_family} · edited {updated}</p>
                    </div>
                    <WidgetCardActions
                      id={widget.id}
                      title={widget.title}
                      embedUrl={`${siteOrigin}/embed/${widget.id}`}
                    />
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
