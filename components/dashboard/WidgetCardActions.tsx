"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function WidgetCardActions({
  id,
  title,
  embedUrl,
}: {
  id: string;
  title: string;
  embedUrl: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1_800);
    } catch {
      setCopyState("error");
    }
  }

  async function deleteWidget() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/widgets/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "The widget could not be deleted.");
      }
      dialogRef.current?.close();
      router.refresh();
    } catch {
      setError("Could not delete this widget. Check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="widget-card-actions">
      <a href={`/editor/${id}`}>Edit</a>
      <button type="button" onClick={copyLink}>
        {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy link"}
      </button>
      <button
        type="button"
        className="danger-link"
        onClick={() => {
          setError(null);
          dialogRef.current?.showModal();
        }}
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        onClose={() => {
          if (!deleting) setError(null);
        }}
      >
        <form method="dialog">
          <button className="dialog-close" value="cancel" aria-label="Close dialog">×</button>
        </form>
        <p className="kicker">Delete widget</p>
        <h2>Remove “{title}”?</h2>
        <p>
          Its embed URL will immediately show the unavailable state. This cannot be undone.
        </p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="dialog-actions">
          <form method="dialog">
            <button className="button button-quiet" value="cancel">Keep widget</button>
          </form>
          <button className="button button-danger" type="button" onClick={deleteWidget} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete widget"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
