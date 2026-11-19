"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({
  email,
  initialName,
}: {
  email: string;
  initialName: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Your profile could not be saved.");
      setState("saved");
      router.refresh();
    } catch {
      setState("idle");
      setError("Your profile could not be saved. Check your connection and try again.");
    }
  }

  return (
    <form className="profile-form" onSubmit={saveProfile}>
      <label htmlFor="email">Email</label>
      <input id="email" value={email} readOnly />
      <label htmlFor="fullName">Your name</label>
      <input
        id="fullName"
        maxLength={80}
        placeholder="Add your name"
        value={fullName}
        onChange={(event) => {
          setFullName(event.target.value);
          setState("idle");
        }}
      />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="profile-submit">
        <button className="button button-primary" type="submit" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save profile"}
        </button>
        {state === "saved" ? <span role="status">Saved</span> : null}
      </div>
    </form>
  );
}
