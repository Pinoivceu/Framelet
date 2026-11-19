import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WidgetRenderer } from "@/components/widget/WidgetRenderer";
import { createDefaultWidget, type WidgetData } from "@/lib/widgets";

const heroClock: WidgetData = {
  id: "demo-clock",
  ...createDefaultWidget("clock"),
  title: "Studio time",
  theme_mode: "system",
  font_family: "mono",
  config: {
    format: "24",
    showSeconds: true,
    showDate: true,
    timezone: "auto",
  },
};

const demoProgress: WidgetData = {
  id: "demo-progress",
  ...createDefaultWidget("progress"),
  title: "November outline",
  theme_mode: "light",
  font_family: "serif",
  config: {
    currentValue: 7,
    maxValue: 10,
    display: "ratio",
    accent: "#ef6b4a",
  },
};

export default function Home() {
  return (
    <main className="marketing-page">
      <header className="marketing-nav">
        <Logo />
        <nav aria-label="Main navigation">
          <Link href="#widgets">Widgets</Link>
          <Link href="#how">How it works</Link>
          <Link className="nav-cta" href="/login">Open the studio</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Widgets that fit the page you already have</p>
          <h1>One useful little frame.</h1>
          <p className="hero-intro">
            Make a clock, countdown, quote, goal, or focus timer. Match your type and color.
            Paste one link into Notion or any website.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/login">Make your first widget</Link>
            <a className="text-link" href="#widgets">See all five widgets</a>
          </div>
          <p className="hero-note">Free. No watermark. No account limits.</p>
        </div>

        <div className="hero-stage" aria-label="Live widget examples">
          <div className="stage-grid" aria-hidden="true" />
          <span className="stage-label">Live preview / system theme</span>
          <div className="hero-widget hero-widget-main">
            <WidgetRenderer widget={heroClock} />
          </div>
          <div className="hero-widget hero-widget-secondary">
            <WidgetRenderer widget={demoProgress} />
          </div>
          <div className="stage-sticker">
            <span>iframe</span>
            <code>width=&quot;100%&quot;</code>
          </div>
        </div>
      </section>

      <section className="widget-catalog" id="widgets">
        <div className="section-heading">
          <p className="kicker">The five essentials</p>
          <h2>Small tools, not another dashboard.</h2>
        </div>
        <div className="catalog-list">
          {[
            ["Clock", "Time zones, seconds, and dates without the clutter."],
            ["Countdown", "Give launches and deadlines a place to land."],
            ["Quote", "A daily line or words that are entirely yours."],
            ["Progress", "Turn a number into a clear sense of movement."],
            ["Pomodoro", "A working focus timer with a short-break cycle."],
          ].map(([name, description], index) => (
            <div className="catalog-row" key={name}>
              <span className="catalog-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{name}</h3>
              <p>{description}</p>
              <Link href={`/editor/new?type=${name.toLowerCase()}`} aria-label={`Create a ${name} widget`}>
                Create
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section" id="how">
        <div>
          <p className="kicker">From blank page to embedded</p>
          <h2>Three edits. One line of HTML.</h2>
        </div>
        <ol className="how-steps">
          <li>
            <strong>Choose a frame</strong>
            <p>Start with one of five useful widgets.</p>
          </li>
          <li>
            <strong>Make it yours</strong>
            <p>Set the content, font, theme, and colors while the live preview updates.</p>
          </li>
          <li>
            <strong>Paste it anywhere</strong>
            <p>Copy a Notion URL or a ready-made responsive iframe.</p>
          </li>
        </ol>
      </section>

      <footer className="marketing-footer">
        <Logo />
        <p>Useful pieces for pages built your way.</p>
        <Link href="/login">Start building</Link>
      </footer>
    </main>
  );
}
