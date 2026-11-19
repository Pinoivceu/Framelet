"use client";

import { FormEvent, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ initialError, nextPath }: { initialError: string | null; nextPath: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function continueWithGoogle() {
    setError(null);
    setPending("google");

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next: nextPath }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Google sign-in could not be started.");
      }
      window.location.assign(payload.url);
    } catch {
      setError("Google sign-in could not be started. Check your connection and try again.");
      setPending(null);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setPending("email");
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, next: nextPath }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "The sign-in link could not be sent.");
      }
      setEmailSent(true);
    } catch {
      setError("The sign-in link could not be sent. Check your connection and try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="auth-form-wrap">
      {emailSent ? (
        <div className="auth-success" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Check your inbox.</strong>
            <p>We sent a sign-in link to {email}. It can be used once.</p>
          </div>
        </div>
      ) : (
        <>
          <button
            className="google-button"
            type="button"
            onClick={continueWithGoogle}
            disabled={pending !== null}
          >
            <span className="google-g" aria-hidden="true">G</span>
            {pending === "google" ? "Connecting…" : "Continue with Google"}
          </button>
          <div className="auth-divider"><span>or use email</span></div>
          <form onSubmit={sendMagicLink} noValidate>
            <label htmlFor="email">Email address</label>
            <div className="auth-email-row">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-error" : undefined}
              />
              <button className="button button-primary" type="submit" disabled={pending !== null}>
                {pending === "email" ? "Sending…" : "Send link"}
              </button>
            </div>
          </form>
        </>
      )}

      {error ? <p className="form-error" id="auth-error" role="alert">{error}</p> : null}
      <p className="auth-terms">
        By continuing, you agree to keep the widgets kind and the pages your own.
      </p>
    </div>
  );
}
