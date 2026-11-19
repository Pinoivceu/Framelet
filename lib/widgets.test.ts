import { describe, expect, it } from "vitest";
import {
  createDefaultWidget,
  iframeHeight,
  normalizeConfig,
  progressPercent,
  splitCountdown,
  validateWidgetInput,
} from "./widgets";

describe("widget behavior", () => {
  it("never renders a negative countdown", () => {
    const result = splitCountdown("2026-01-01T00:00:00.000Z", Date.parse("2026-01-02T00:00:00.000Z"));
    expect(result.distance).toBe(0);
    expect(result.complete).toBe(true);
  });

  it("clamps the progress bar but keeps the actual ratio label data", () => {
    expect(progressPercent(120, 100)).toBe(100);
    const config = normalizeConfig("progress", {
      currentValue: 120,
      maxValue: 100,
      display: "ratio",
      accent: "#ff0000",
    });
    expect(config).toMatchObject({ currentValue: 120, maxValue: 100 });
  });

  it("rejects a progress target below one", () => {
    const result = validateWidgetInput({
      title: "Launch",
      type: "progress",
      theme_mode: "system",
      font_family: "sans",
      config: { currentValue: 4, maxValue: 0 },
    });
    expect(result.ok).toBe(false);
  });

  it("falls back to a safe timezone", () => {
    const config = normalizeConfig("clock", { timezone: "Mars/Olympus_Mons" });
    expect(config).toMatchObject({ timezone: "auto" });
  });

  it("rejects an invalid IANA timezone at the API boundary", () => {
    const result = validateWidgetInput({
      title: "Local time",
      type: "clock",
      theme_mode: "system",
      font_family: "sans",
      config: { timezone: "Mars/Olympus_Mons" },
    });
    expect(result.ok).toBe(false);
  });

  it("uses widget-specific iframe heights", () => {
    expect(iframeHeight("progress")).toBe(140);
    expect(iframeHeight("pomodoro")).toBe(230);
  });

  it("creates each widget with usable defaults", () => {
    for (const type of ["clock", "countdown", "quote", "progress", "pomodoro"] as const) {
      expect(createDefaultWidget(type).type).toBe(type);
    }
  });
});
