import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : "/dashboard";
  const message = params.error === "expired"
    ? "Link login sudah kadaluarsa atau tidak valid. Silakan minta link baru."
    : params.error
      ? "Sign-in could not be completed. Please try again."
      : null;

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Logo />
        <div className="auth-copy">
          <p className="kicker">Your widget studio</p>
          <h1>Come in and make something small.</h1>
          <p>Save your widgets, edit them later, and keep every embed link working.</p>
        </div>
        <LoginForm initialError={message} nextPath={next} />
      </div>
      <aside className="auth-aside" aria-label="Framelet introduction">
        <div className="auth-aside-copy">
          <span className="auth-frame" aria-hidden="true"><i /><i /><i /><i /></span>
          <p>Five useful widgets. Four typefaces. One clean frame.</p>
          <small>Built for Notion pages and the open web.</small>
        </div>
      </aside>
    </main>
  );
}
