export type WidgetType = "clock" | "countdown" | "quote" | "progress" | "pomodoro";
export type ThemeMode = "light" | "dark" | "system";
export type FontFamily = "sans" | "serif" | "mono" | "rounded";

export interface ClockConfig {
  format: "12" | "24";
  showSeconds: boolean;
  showDate: boolean;
  timezone: string;
}

export interface CountdownConfig {
  targetDate: string;
  completionMessage: string;
}

export interface QuoteConfig {
  sourceMode: "daily" | "custom";
  quote: string;
  author: string;
  alignment: "left" | "center";
}

export interface ProgressConfig {
  currentValue: number;
  maxValue: number;
  display: "percent" | "ratio";
  accent: string;
}

export interface PomodoroConfig {
  focusMinutes: number;
  breakMinutes: number;
}

export type AnyWidgetConfig =
  | ClockConfig
  | CountdownConfig
  | QuoteConfig
  | ProgressConfig
  | PomodoroConfig;

export interface WidgetData {
  id: string;
  title: string;
  type: WidgetType;
  theme_mode: ThemeMode;
  font_family: FontFamily;
  config: AnyWidgetConfig;
  created_at?: string;
  updated_at?: string;
}

export interface WidgetInput {
  title: string;
  type: WidgetType;
  theme_mode: ThemeMode;
  font_family: FontFamily;
  config: unknown;
}

export const WIDGET_TYPES: Array<{
  type: WidgetType;
  label: string;
  description: string;
  height: number;
}> = [
  {
    type: "clock",
    label: "Clock",
    description: "Local time, timezone, seconds, and date.",
    height: 200,
  },
  {
    type: "countdown",
    label: "Countdown",
    description: "A live countdown to a date and time.",
    height: 210,
  },
  {
    type: "quote",
    label: "Quote",
    description: "A daily quote or your own words.",
    height: 200,
  },
  {
    type: "progress",
    label: "Progress",
    description: "A goal, ratio, or percentage.",
    height: 140,
  },
  {
    type: "pomodoro",
    label: "Pomodoro",
    description: "A focused timer with short breaks.",
    height: 230,
  },
];

export const FONT_OPTIONS: Array<{ value: FontFamily; label: string }> = [
  { value: "sans", label: "Inter" },
  { value: "serif", label: "Playfair Display" },
  { value: "mono", label: "JetBrains Mono" },
  { value: "rounded", label: "Nunito" },
];

export const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const DEFAULT_CONFIGS: Record<WidgetType, AnyWidgetConfig> = {
  clock: {
    format: "24",
    showSeconds: false,
    showDate: true,
    timezone: "auto",
  },
  countdown: {
    targetDate: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    completionMessage: "The wait is over.",
  },
  quote: {
    sourceMode: "daily",
    quote: "Small steps still change the view.",
    author: "Framelet",
    alignment: "left",
  },
  progress: {
    currentValue: 7,
    maxValue: 10,
    display: "ratio",
    accent: "#3157f6",
  },
  pomodoro: {
    focusMinutes: 25,
    breakMinutes: 5,
  },
};

export const DAILY_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { quote: "What we do today matters most.", author: "Buddha" },
  { quote: "Make it work, make it right, make it clear.", author: "Kent Beck" },
  { quote: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { quote: "The best way out is always through.", author: "Robert Frost" },
  { quote: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
] as const;

const widgetTypes = new Set<WidgetType>(["clock", "countdown", "quote", "progress", "pomodoro"]);
const themeModes = new Set<ThemeMode>(["light", "dark", "system"]);
const fontFamilies = new Set<FontFamily>(["sans", "serif", "mono", "rounded"]);

function stringValue(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function validTimezone(value: string) {
  if (value === "auto") return true;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeConfig(type: WidgetType, input: unknown): AnyWidgetConfig {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const fallback = DEFAULT_CONFIGS[type];

  if (type === "clock") {
    const base = fallback as ClockConfig;
    const requestedTimezone = stringValue(raw.timezone, base.timezone, 64);
    return {
      format: raw.format === "12" ? "12" : "24",
      showSeconds: booleanValue(raw.showSeconds, base.showSeconds),
      showDate: booleanValue(raw.showDate, base.showDate),
      timezone: validTimezone(requestedTimezone) ? requestedTimezone : base.timezone,
    };
  }

  if (type === "countdown") {
    const base = fallback as CountdownConfig;
    const requestedDate = stringValue(raw.targetDate, base.targetDate, 64);
    return {
      targetDate: Number.isNaN(Date.parse(requestedDate)) ? base.targetDate : requestedDate,
      completionMessage: stringValue(raw.completionMessage, base.completionMessage, 120),
    };
  }

  if (type === "quote") {
    const base = fallback as QuoteConfig;
    return {
      sourceMode: raw.sourceMode === "custom" ? "custom" : "daily",
      quote: stringValue(raw.quote, base.quote, 280),
      author: stringValue(raw.author, base.author, 80),
      alignment: raw.alignment === "center" ? "center" : "left",
    };
  }

  if (type === "progress") {
    const base = fallback as ProgressConfig;
    const accent = stringValue(raw.accent, base.accent, 7);
    return {
      currentValue: numberValue(raw.currentValue, base.currentValue, 0, 1_000_000_000),
      maxValue: numberValue(raw.maxValue, base.maxValue, 1, 1_000_000_000),
      display: raw.display === "percent" ? "percent" : "ratio",
      accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : base.accent,
    };
  }

  const base = fallback as PomodoroConfig;
  return {
    focusMinutes: numberValue(raw.focusMinutes, base.focusMinutes, 1, 180),
    breakMinutes: numberValue(raw.breakMinutes, base.breakMinutes, 1, 60),
  };
}

export function validateWidgetInput(input: unknown):
  | { ok: true; value: WidgetInput }
  | { ok: false; errors: Record<string, string> } {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const title = stringValue(raw.title, "", 80);
  const type = raw.type as WidgetType;
  const theme_mode = raw.theme_mode as ThemeMode;
  const font_family = raw.font_family as FontFamily;
  const errors: Record<string, string> = {};

  if (!title) errors.title = "Give your widget a name.";
  if (!widgetTypes.has(type)) errors.type = "Choose a valid widget type.";
  if (!themeModes.has(theme_mode)) errors.theme_mode = "Choose a valid theme.";
  if (!fontFamilies.has(font_family)) errors.font_family = "Choose a valid font.";

  if (type === "clock") {
    const request = raw.config && typeof raw.config === "object"
      ? (raw.config as Record<string, unknown>)
      : {};
    const timezone = stringValue(request.timezone, "auto", 64);
    if (!validTimezone(timezone)) {
      errors.timezone = "Use Auto local or a valid IANA timezone.";
    }
  }

  if (type === "countdown") {
    const request = raw.config && typeof raw.config === "object"
      ? (raw.config as Record<string, unknown>)
      : {};
    const target = stringValue(request.targetDate, "", 64);
    if (!target || Number.isNaN(Date.parse(target))) {
      errors.targetDate = "Choose a valid target date and time.";
    }
  }

  if (type === "progress") {
    const request = raw.config && typeof raw.config === "object"
      ? (raw.config as Record<string, unknown>)
      : {};
    const max = Number(request.maxValue);
    if (!Number.isFinite(max) || max < 1) {
      errors.maxValue = "The target must be at least 1.";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      type,
      theme_mode,
      font_family,
      config: normalizeConfig(type, raw.config),
    },
  };
}

export function createDefaultWidget(type: WidgetType): Omit<WidgetData, "id"> {
  const option = WIDGET_TYPES.find((item) => item.type === type) ?? WIDGET_TYPES[0];
  return {
    title: `My ${option.label}`,
    type: option.type,
    theme_mode: "system",
    font_family: "sans",
    config: structuredClone(DEFAULT_CONFIGS[option.type]),
  };
}

export function iframeHeight(type: WidgetType) {
  return WIDGET_TYPES.find((item) => item.type === type)?.height ?? 200;
}

export function iframeSnippet(origin: string, widget: Pick<WidgetData, "id" | "type">) {
  return `<iframe src="${origin}/embed/${widget.id}" width="100%" height="${iframeHeight(widget.type)}" frameborder="0" style="border:none; overflow:hidden;"></iframe>`;
}

export function progressPercent(current: number, max: number) {
  return Math.min(100, Math.max(0, (current / Math.max(1, max)) * 100));
}

export function splitCountdown(targetDate: string, now = Date.now()) {
  const distance = Math.max(0, Date.parse(targetDate) - now);
  return {
    distance,
    complete: distance === 0,
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function dailyQuote(now = new Date()) {
  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000,
  );
  return DAILY_QUOTES[dayNumber % DAILY_QUOTES.length];
}

export function toDateTimeLocal(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
