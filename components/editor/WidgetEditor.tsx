"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WidgetRenderer } from "@/components/widget/WidgetRenderer";
import {
  FONT_OPTIONS,
  THEME_OPTIONS,
  WIDGET_TYPES,
  createDefaultWidget,
  iframeSnippet,
  toDateTimeLocal,
  validTimezone,
  type ClockConfig,
  type CountdownConfig,
  type FontFamily,
  type PomodoroConfig,
  type ProgressConfig,
  type QuoteConfig,
  type ThemeMode,
  type WidgetData,
  type WidgetType,
} from "@/lib/widgets";

type EditorWidget = Omit<WidgetData, "id" | "created_at"> & { id?: string };

export function WidgetEditor({
  initialWidget,
  initialType,
  siteOrigin,
}: {
  initialWidget: EditorWidget | null;
  initialType: WidgetType;
  siteOrigin: string;
}) {
  const router = useRouter();
  const embedDialog = useRef<HTMLDialogElement>(null);
  const [widget, setWidget] = useState<EditorWidget>(
    initialWidget ?? createDefaultWidget(initialType),
  );
  const [widgetId, setWidgetId] = useState(initialWidget?.id ?? null);
  const [hostMode, setHostMode] = useState<"light" | "dark">("light");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<"url" | "iframe" | null>(null);

  const typeMeta = WIDGET_TYPES.find((item) => item.type === widget.type) ?? WIDGET_TYPES[0];
  const previewWidget: WidgetData = {
    ...widget,
    id: widgetId ?? "preview",
  };
  const directUrl = widgetId ? `${siteOrigin}/embed/${widgetId}` : "";
  const snippet = widgetId ? iframeSnippet(siteOrigin, previewWidget) : "";

  function updateConfig(patch: Record<string, unknown>) {
    setWidget((current) => ({
      ...current,
      config: { ...current.config, ...patch } as EditorWidget["config"],
    }));
    setStatus("idle");
  }

  function updateGlobal<K extends "title" | "theme_mode" | "font_family">(
    key: K,
    value: EditorWidget[K],
  ) {
    setWidget((current) => ({ ...current, [key]: value }));
    setStatus("idle");
  }

  async function saveWidget(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setStatus("saving");
    setMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch(
        widgetId ? `/api/widgets/${widgetId}` : "/api/widgets",
        {
          method: widgetId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: widget.title,
            type: widget.type,
            theme_mode: widget.theme_mode,
            font_family: widget.font_family,
            config: widget.config,
          }),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setFieldErrors(payload?.fields ?? {});
        throw new Error(payload?.error || "The widget could not be saved.");
      }

      const saved = payload.widget as WidgetData;
      setWidget(saved);
      setWidgetId(saved.id);
      setStatus("saved");

      if (!initialWidget?.id) {
        router.replace(`/editor/${saved.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setStatus("idle");
      setMessage(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Could not save. Your edits are still here; check your connection and try again.",
      );
    }
  }

  async function copyValue(value: string, kind: "url" | "iframe") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1_800);
    } catch {
      setMessage("Copy failed. Select the text and copy it manually.");
    }
  }

  function openEmbed() {
    if (!widgetId) {
      setMessage("Save the widget once to create its permanent embed link.");
      return;
    }
    setMessage(null);
    embedDialog.current?.showModal();
  }

  return (
    <>
      <header className="editor-header">
        <div className="editor-header-left">
          <a className="back-link" href="/dashboard">← All widgets</a>
          <span className="editor-divider" />
          <span className="editor-type">{typeMeta.label}</span>
        </div>
        <div className="editor-actions">
          <span className={`save-status status-${status}`} role="status">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : widgetId ? "Saved earlier" : "Unsaved"}
          </span>
          <button className="button button-quiet" type="button" onClick={openEmbed}>
            Embed
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => saveWidget()}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save widget"}
          </button>
        </div>
      </header>

      <main className="editor-shell">
        <section className="editor-form-panel" aria-label="Widget settings">
          <form onSubmit={saveWidget} noValidate>
            <div className="editor-intro">
              <p className="kicker">Configuration</p>
              <h1>{widgetId ? "Edit the details." : "Build the frame."}</h1>
              <p>Changes appear in the live preview immediately.</p>
            </div>

            <fieldset className="form-section">
              <legend>Basics</legend>
              <label htmlFor="widget-title">Widget title</label>
              <input
                id="widget-title"
                maxLength={80}
                value={widget.title}
                onChange={(event) => updateGlobal("title", event.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}

              <label htmlFor="font-family">Font</label>
              <select
                id="font-family"
                value={widget.font_family}
                onChange={(event) => updateGlobal("font_family", event.target.value as FontFamily)}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>

              <label htmlFor="theme-mode">Theme mode</label>
              <select
                id="theme-mode"
                value={widget.theme_mode}
                onChange={(event) => updateGlobal("theme_mode", event.target.value as ThemeMode)}
              >
                {THEME_OPTIONS.map((theme) => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>
            </fieldset>

            <WidgetSpecificFields
              widget={widget}
              errors={fieldErrors}
              updateConfig={updateConfig}
            />

            {message ? <p className="editor-message" role="alert">{message}</p> : null}

            <button className="button button-primary mobile-save" type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save widget"}
            </button>
          </form>
        </section>

        <section className="preview-panel" aria-label="Live widget preview">
          <div className="preview-toolbar">
            <div>
              <span className="preview-dot" aria-hidden="true" />
              Live preview
            </div>
            <div className="host-toggle" aria-label="Simulate host page theme">
              <button
                type="button"
                className={hostMode === "light" ? "active" : ""}
                onClick={() => setHostMode("light")}
              >
                Light host
              </button>
              <button
                type="button"
                className={hostMode === "dark" ? "active" : ""}
                onClick={() => setHostMode("dark")}
              >
                Dark host
              </button>
            </div>
          </div>
          <div className={`preview-stage host-${hostMode}`}>
            <div className="preview-grid" aria-hidden="true" />
            <div className={`preview-frame preview-${widget.type}`}>
              <WidgetRenderer widget={previewWidget} />
            </div>
            <span className="preview-size">
              responsive · {typeMeta.height}px default
            </span>
          </div>
          <p className="preview-note">
            The system theme follows the host browser. Use the host switch to check both modes.
          </p>
        </section>
      </main>

      <dialog ref={embedDialog} className="embed-dialog">
        <form method="dialog">
          <button className="dialog-close" value="close" aria-label="Close embed panel">×</button>
        </form>
        <p className="kicker">Ready to embed</p>
        <h2>Put this widget on the page.</h2>
        <p className="embed-intro">
          Paste the URL into a Notion embed block, or use the HTML snippet on any website.
        </p>
        <div className="embed-option">
          <div>
            <strong>Direct URL</strong>
            <small>Best for Notion</small>
          </div>
          <code>{directUrl}</code>
          <button type="button" onClick={() => copyValue(directUrl, "url")}>
            {copied === "url" ? "Copied" : "Copy URL"}
          </button>
        </div>
        <div className="embed-option embed-option-code">
          <div>
            <strong>HTML iframe</strong>
            <small>Responsive width</small>
          </div>
          <code>{snippet}</code>
          <button type="button" onClick={() => copyValue(snippet, "iframe")}>
            {copied === "iframe" ? "Copied" : "Copy code"}
          </button>
        </div>
        <p className="embed-note">
          Edits automatically update every place this widget is embedded.
        </p>
      </dialog>
    </>
  );
}

function WidgetSpecificFields({
  widget,
  errors,
  updateConfig,
}: {
  widget: EditorWidget;
  errors: Record<string, string>;
  updateConfig: (patch: Record<string, unknown>) => void;
}) {
  if (widget.type === "clock") {
    const config = widget.config as ClockConfig;
    return (
      <fieldset className="form-section">
        <legend>Clock details</legend>
        <div className="form-grid-two">
          <label>
            Time format
            <select value={config.format} onChange={(event) => updateConfig({ format: event.target.value })}>
              <option value="24">24-hour</option>
              <option value="12">12-hour</option>
            </select>
          </label>
          <label>
            Timezone
            <input
              value={config.timezone}
              list="timezone-options"
              onChange={(event) => updateConfig({ timezone: event.target.value })}
              aria-invalid={Boolean(errors.timezone) || !validTimezone(config.timezone)}
            />
            <datalist id="timezone-options">
              <option value="auto">Auto local</option>
              <option value="Asia/Jakarta" />
              <option value="America/New_York" />
              <option value="Europe/London" />
              <option value="Asia/Tokyo" />
              <option value="Australia/Sydney" />
            </datalist>
          </label>
        </div>
        {errors.timezone || !validTimezone(config.timezone)
          ? <p className="field-error">{errors.timezone || "Use Auto local or a valid IANA timezone."}</p>
          : null}
        <label className="check-row">
          <input
            type="checkbox"
            checked={config.showSeconds}
            onChange={(event) => updateConfig({ showSeconds: event.target.checked })}
          />
          Show seconds
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={config.showDate}
            onChange={(event) => updateConfig({ showDate: event.target.checked })}
          />
          Show date
        </label>
      </fieldset>
    );
  }

  if (widget.type === "countdown") {
    const config = widget.config as CountdownConfig;
    return (
      <fieldset className="form-section">
        <legend>Countdown details</legend>
        <label htmlFor="target-date">Target date and time</label>
        <input
          id="target-date"
          type="datetime-local"
          value={toDateTimeLocal(config.targetDate)}
          onChange={(event) => {
            const date = new Date(event.target.value);
            updateConfig({ targetDate: Number.isNaN(date.getTime()) ? "" : date.toISOString() });
          }}
          aria-invalid={Boolean(errors.targetDate)}
        />
        {errors.targetDate ? <p className="field-error">{errors.targetDate}</p> : null}
        <label htmlFor="completion-message">When time runs out</label>
        <input
          id="completion-message"
          maxLength={120}
          value={config.completionMessage}
          placeholder="The wait is over."
          onChange={(event) => updateConfig({ completionMessage: event.target.value })}
        />
      </fieldset>
    );
  }

  if (widget.type === "quote") {
    const config = widget.config as QuoteConfig;
    return (
      <fieldset className="form-section">
        <legend>Quote details</legend>
        <div className="segmented">
          <button
            type="button"
            className={config.sourceMode === "daily" ? "active" : ""}
            onClick={() => updateConfig({ sourceMode: "daily" })}
          >
            Daily quote
          </button>
          <button
            type="button"
            className={config.sourceMode === "custom" ? "active" : ""}
            onClick={() => updateConfig({ sourceMode: "custom" })}
          >
            Write my own
          </button>
        </div>
        {config.sourceMode === "custom" ? (
          <>
            <label htmlFor="quote-text">Quote</label>
            <textarea
              id="quote-text"
              rows={4}
              maxLength={280}
              value={config.quote}
              onChange={(event) => updateConfig({ quote: event.target.value })}
            />
            <label htmlFor="quote-author">Author</label>
            <input
              id="quote-author"
              maxLength={80}
              value={config.author}
              onChange={(event) => updateConfig({ author: event.target.value })}
            />
          </>
        ) : null}
        <label htmlFor="quote-alignment">Text alignment</label>
        <select
          id="quote-alignment"
          value={config.alignment}
          onChange={(event) => updateConfig({ alignment: event.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
        </select>
      </fieldset>
    );
  }

  if (widget.type === "progress") {
    const config = widget.config as ProgressConfig;
    return (
      <fieldset className="form-section">
        <legend>Progress details</legend>
        <div className="form-grid-two">
          <label>
            Current value
            <input
              type="number"
              min={0}
              value={config.currentValue}
              onChange={(event) => updateConfig({ currentValue: Number(event.target.value) })}
            />
          </label>
          <label>
            Target value
            <input
              type="number"
              min={1}
              value={config.maxValue}
              onChange={(event) => updateConfig({ maxValue: Number(event.target.value) })}
              aria-invalid={Boolean(errors.maxValue)}
            />
          </label>
        </div>
        {errors.maxValue ? <p className="field-error">{errors.maxValue}</p> : null}
        <label>
          Number display
          <select value={config.display} onChange={(event) => updateConfig({ display: event.target.value })}>
            <option value="ratio">Ratio (7 / 10)</option>
            <option value="percent">Percentage (70%)</option>
          </select>
        </label>
        <label className="color-field" htmlFor="accent-color">
          Bar color
          <span>
            <input
              id="accent-color"
              type="color"
              value={config.accent}
              onChange={(event) => updateConfig({ accent: event.target.value })}
            />
            <code>{config.accent}</code>
          </span>
        </label>
      </fieldset>
    );
  }

  const config = widget.config as PomodoroConfig;
  return (
    <fieldset className="form-section">
      <legend>Timer details</legend>
      <div className="form-grid-two">
        <label>
          Focus minutes
          <input
            type="number"
            min={1}
            max={180}
            value={config.focusMinutes}
            onChange={(event) => updateConfig({ focusMinutes: Number(event.target.value) })}
          />
        </label>
        <label>
          Break minutes
          <input
            type="number"
            min={1}
            max={60}
            value={config.breakMinutes}
            onChange={(event) => updateConfig({ breakMinutes: Number(event.target.value) })}
          />
        </label>
      </div>
      <p className="field-help">The timer runs in the visitor’s browser and resets on refresh.</p>
    </fieldset>
  );
}
