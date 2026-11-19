"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dailyQuote,
  progressPercent,
  splitCountdown,
  type AnyWidgetConfig,
  type ClockConfig,
  type CountdownConfig,
  type PomodoroConfig,
  type ProgressConfig,
  type QuoteConfig,
  type WidgetData,
} from "@/lib/widgets";

type RenderWidget = Pick<WidgetData, "id" | "title" | "type" | "theme_mode" | "font_family" | "config">;

function ClockWidget({ config }: { config: ClockConfig }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const timezone = config.timezone === "auto" ? undefined : config.timezone;
  const time = now === null
    ? "--:--"
    : new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        second: config.showSeconds ? "2-digit" : undefined,
        hour12: config.format === "12",
        timeZone: timezone,
      }).format(now);
  const date = now === null || !config.showDate
    ? null
    : new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: timezone,
      }).format(now);

  return (
    <div className="widget-clock">
      <p className="widget-time">{time}</p>
      {date ? <p className="widget-date">{date}</p> : null}
      <span className="widget-rule" aria-hidden="true" />
    </div>
  );
}

function CountdownWidget({ config }: { config: CountdownConfig }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const countdown = splitCountdown(config.targetDate, now ?? Date.parse(config.targetDate));
  const values = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds];
  const labels = ["days", "hrs", "min", "sec"];

  return countdown.complete ? (
    <div className="widget-complete">
      <span className="complete-dot" aria-hidden="true" />
      <p>{config.completionMessage || "00:00:00"}</p>
    </div>
  ) : (
    <div className="countdown-grid" aria-label="Time remaining">
      {values.map((value, index) => (
        <div className="countdown-unit" key={labels[index]}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

function QuoteWidget({ config }: { config: QuoteConfig }) {
  const quote = useMemo(
    () => config.sourceMode === "custom"
      ? { quote: config.quote || "Your quote goes here.", author: config.author || "Unknown" }
      : dailyQuote(),
    [config.author, config.quote, config.sourceMode],
  );

  return (
    <figure className={`widget-quote quote-${config.alignment}`}>
      <span className="quote-mark" aria-hidden="true">“</span>
      <blockquote>{quote.quote}</blockquote>
      <figcaption>{quote.author}</figcaption>
    </figure>
  );
}

function ProgressWidget({ config }: { config: ProgressConfig }) {
  const percentage = progressPercent(config.currentValue, config.maxValue);
  const label = config.display === "percent"
    ? `${Math.round(percentage)}%`
    : `${config.currentValue} / ${config.maxValue}`;

  return (
    <div className="widget-progress">
      <div className="progress-copy">
        <span>Progress</span>
        <strong>{label}</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={config.maxValue}
        aria-valuenow={Math.min(config.currentValue, config.maxValue)}
      >
        <span style={{ width: `${percentage}%`, background: config.accent }} />
      </div>
    </div>
  );
}

function PomodoroWidget({ config }: { config: PomodoroConfig }) {
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(config.focusMinutes * 60);
  const [running, setRunning] = useState(false);

  const duration = (phase === "focus" ? config.focusMinutes : config.breakMinutes) * 60;

  useEffect(() => {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(config.focusMinutes * 60);
  }, [config.breakMinutes, config.focusMinutes]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [config.breakMinutes, config.focusMinutes, running]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    const nextPhase = phase === "focus" ? "break" : "focus";
    setPhase(nextPhase);
    setSecondsLeft((nextPhase === "focus" ? config.focusMinutes : config.breakMinutes) * 60);
  }, [config.breakMinutes, config.focusMinutes, phase, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  function reset() {
    setRunning(false);
    setSecondsLeft(duration);
  }

  return (
    <div className="widget-pomodoro">
      <div className="pomodoro-meta">
        <span className={`phase-dot phase-${phase}`} aria-hidden="true" />
        <span>{phase === "focus" ? "Focus" : "Short break"}</span>
      </div>
      <p className="pomodoro-time" aria-live="polite">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      <div className="pomodoro-controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>
          {running ? "Pause" : "Start"}
        </button>
        <button type="button" className="secondary" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export function WidgetRenderer({ widget }: { widget: RenderWidget }) {
  const config = widget.config as AnyWidgetConfig;

  return (
    <section
      className={`widget theme-${widget.theme_mode}`}
      data-font={widget.font_family}
      data-type={widget.type}
      data-widget-id={widget.id}
    >
      <div className="widget-heading">
        <h2>{widget.title}</h2>
        <span className="widget-corners" aria-hidden="true" />
      </div>
      <div className="widget-body">
        {widget.type === "clock" ? <ClockWidget config={config as ClockConfig} /> : null}
        {widget.type === "countdown" ? <CountdownWidget config={config as CountdownConfig} /> : null}
        {widget.type === "quote" ? <QuoteWidget config={config as QuoteConfig} /> : null}
        {widget.type === "progress" ? <ProgressWidget config={config as ProgressConfig} /> : null}
        {widget.type === "pomodoro" ? <PomodoroWidget config={config as PomodoroConfig} /> : null}
      </div>
    </section>
  );
}
