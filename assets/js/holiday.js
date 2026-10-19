// Seasonal themes, configured in _data/holidays.yml. Runs in <head> before
// theme.js so a holiday can force the dark/light palette before first paint.
const holidayPreviewKey = "holiday-preview";
const holidayDismissKey = "holiday-dismissed";
const holidayPatterns = ["cobweb", "stars", "snowflakes", "hearts"];
// Per effect: particle count, and [min, max] ranges for duration (s), size (px)
// and vertical position (vh, used by effects that do not fall from the top).
const holidayEffects = {
  bats: { count: 7, duration: [16, 30], size: [44, 76], y: [4, 70] },
  leaves: { count: 14, duration: [9, 20], size: [8, 20] },
  snow: { count: 40, duration: [9, 20], size: [8, 20] },
  petals: { count: 18, duration: [9, 20], size: [8, 20] },
  sparkles: { count: 34, duration: [3, 7], size: [16, 32], y: [2, 98] },
};

const holidayStorageGet = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
};

const holidayStorageSet = (storage, key, value) => {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch (error) {
    // Without storage the choice only lasts for this page.
  }
};

// "MM-DD" or "YYYY-MM-DD" (also tolerates a YAML Date rendered by jsonify).
const parseHolidayDate = (value) => {
  const match = String(value || "").match(/^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  return { year: match[1] ? Number(match[1]) : null, day: Number(match[2]) * 100 + Number(match[3]) };
};

const holidayIsActive = (holiday, today) => {
  const start = parseHolidayDate(holiday.start);
  const end = parseHolidayDate(holiday.end);
  if (!start || !end) return false;

  const day = (today.getMonth() + 1) * 100 + today.getDate();
  if (start.year && end.year) {
    const now = today.getFullYear() * 10000 + day;
    return start.year * 10000 + start.day <= now && now <= end.year * 10000 + end.day;
  }
  // A window like 12-30 → 01-02 wraps the new year.
  return start.day <= end.day ? start.day <= day && day <= end.day : day >= start.day || day <= end.day;
};

const holidayDismissValue = (holiday) => `${holiday.name}:${new Date().getFullYear()}`;

// ?holiday=<name> previews an entry for the rest of the tab session,
// ?holiday=off disables theming for the session, ?holiday=auto goes back to the date.
const findHoliday = (holidays) => {
  const requested = new URLSearchParams(window.location.search).get("holiday");
  if (requested === "auto") holidayStorageSet(sessionStorage, holidayPreviewKey, null);
  else if (requested) holidayStorageSet(sessionStorage, holidayPreviewKey, requested);

  const preview = holidayStorageGet(sessionStorage, holidayPreviewKey);
  if (preview === "off") return null;
  if (preview) {
    const match = holidays.find((holiday) => holiday.name === preview);
    if (match) return { holiday: match, preview: true };
  }

  const today = new Date();
  const holiday = holidays.find((entry) => holidayIsActive(entry, today));
  if (!holiday || holidayStorageGet(localStorage, holidayDismissKey) === holidayDismissValue(holiday)) return null;
  return { holiday, preview: false };
};

const holidayPalette = (holiday) => {
  const vars = {};
  const { background, text, accent } = holiday;
  const card = holiday.card || (background && text && `color-mix(in srgb, ${background} 92%, ${text})`);
  const muted = holiday.muted || (background && text && `color-mix(in srgb, ${text} 68%, ${background})`);

  if (background) {
    Object.assign(vars, {
      "--global-bg-color": background,
      "--global-newsletter-bg-color": background,
      "--global-hover-text-color": background,
      "--global-footer-bg-color": `color-mix(in srgb, ${background} 72%, #000)`,
      "--paper-color": background,
    });
  }
  if (card) Object.assign(vars, { "--global-card-bg-color": card, "--paper-card-color": card });
  if (text) {
    Object.assign(vars, {
      "--global-text-color": text,
      "--global-newsletter-text-color": text,
      "--global-footer-text-color": text,
      "--global-divider-color": `color-mix(in srgb, ${text} 16%, transparent)`,
      "--paper-ink": text,
      "--paper-rule": `color-mix(in srgb, ${text} 72%, transparent)`,
      "--paper-fine-rule": `color-mix(in srgb, ${text} 24%, transparent)`,
    });
  }
  if (muted) Object.assign(vars, { "--global-text-color-light": muted, "--paper-muted": muted });
  if (accent) {
    Object.assign(vars, {
      "--global-theme-color": accent,
      "--global-hover-color": accent,
      "--global-footer-link-color": accent,
      "--paper-accent": accent,
    });
  }
  if (holiday.heading_font) vars["--holiday-heading-font"] = `"${holiday.heading_font}", var(--serif-display)`;
  return vars;
};

const emojiIcon = (emoji) =>
  `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;

const holidaySvg = {
  bats: '<svg viewBox="0 0 64 28" aria-hidden="true"><path fill="currentColor" d="M32 6c-1.6 0-2.6 1.6-2.6 1.6L28.2 4l-.9 4.2C24.6 9.6 20 5 13 3c1.6 4-.6 7.6-4.4 7.4C5.6 10.3 3 11.5 0 11c6 2.6 10 7.6 11.6 14 2.4-3 6.4-3.6 9.2-1.6 2-3 6-3.2 8.8.2L32 21l2.4 2.6c2.8-3.4 6.8-3.2 8.8-.2 2.8-2 6.8-1.4 9.2 1.6C54 18.6 58 13.6 64 11c-3 .5-5.6-.7-8.6-.6-3.8.2-6-3.4-4.4-7.4-7 2-11.6 6.6-14.3 5.2L35.8 4l-1.2 3.6S33.6 6 32 6z"/></svg>',
  leaves:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 3C10 3 4 8 4 15c0 1.8.5 3.4 1.2 4.6L3 22l1.4 1 2.1-2.2C7.8 21.6 9.4 22 11 22c7 0 10-7 9-19zM8 18c2-4 5-7 9-10-3 3.4-5.6 6.6-7.6 10.6z"/></svg>',
};

const startHolidayEffect = (effect) => {
  const config = holidayEffects[effect];
  if (!config || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "holiday-effect";
  layer.setAttribute("data-effect", effect);
  layer.setAttribute("aria-hidden", "true");

  const random = (min, max) => min + Math.random() * (max - min);
  for (let i = 0; i < config.count; i++) {
    const particle = document.createElement("span");
    particle.className = "holiday-particle";
    const duration = random(...config.duration);
    particle.style.setProperty("--x", `${random(0, 100)}vw`);
    if (config.y) particle.style.setProperty("--y", `${random(...config.y)}vh`);
    particle.style.setProperty("--size", `${random(...config.size)}px`);
    particle.style.setProperty("--duration", `${duration}s`);
    // Negative delays spread the first wave so nothing arrives all at once.
    particle.style.setProperty("--delay", `${-random(0, duration)}s`);
    particle.style.setProperty("--drift", `${random(-14, 14)}vw`);
    particle.style.setProperty("--spin", `${random(-540, 540)}deg`);
    particle.style.setProperty("--alpha", random(0.35, 0.8).toFixed(2));
    if (holidaySvg[effect]) particle.innerHTML = holidaySvg[effect];
    layer.appendChild(particle);
  }
  document.body.appendChild(layer);
};

const dismissHoliday = (holiday, preview) => {
  if (preview) holidayStorageSet(sessionStorage, holidayPreviewKey, "off");
  else holidayStorageSet(localStorage, holidayDismissKey, holidayDismissValue(holiday));

  const url = new URL(window.location.href);
  url.searchParams.delete("holiday");
  window.location.replace(url.toString());
};

const decorateHolidayPage = (holiday, preview) => {
  if (holiday.mark) {
    document.querySelectorAll(".post-header .post-title, .navbar-brand.title, .newspaper-title").forEach((title) => {
      const mark = document.createElement("span");
      mark.className = "holiday-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = holiday.mark;
      title.appendChild(mark);
    });
  }

  if (holiday.greeting) {
    const strip = document.createElement("div");
    strip.className = "holiday-greeting";
    strip.setAttribute("role", "note");

    const text = document.createElement("span");
    text.textContent = holiday.greeting;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "holiday-greeting-close";
    close.setAttribute("aria-label", "Turn off the seasonal theme");
    close.setAttribute("title", "Turn off the seasonal theme");
    close.textContent = "×";
    close.addEventListener("click", () => dismissHoliday(holiday, preview));

    strip.append(text, close);
    const header = document.querySelector("body > header");
    if (header) header.after(strip);
    else document.body.prepend(strip);
  }

  if (holiday.effect) startHolidayEffect(holiday.effect);
};

const initHoliday = (holidays) => {
  if (!Array.isArray(holidays) || holidays.length === 0) return;
  const found = findHoliday(holidays);
  if (!found) return;
  const { holiday, preview } = found;

  const root = document.documentElement;
  root.setAttribute("data-holiday", holiday.name);
  if (holiday.mode === "dark" || holiday.mode === "light") root.setAttribute("data-holiday-mode", holiday.mode);
  if (holidayPatterns.includes(holiday.pattern)) root.setAttribute("data-holiday-pattern", holiday.pattern);
  if (holiday.heading_font) root.setAttribute("data-holiday-font", "");

  // Inline custom properties outrank every stylesheet rule, so one palette
  // covers light, dark and the newspaper layout alike.
  Object.entries(holidayPalette(holiday)).forEach(([name, value]) => root.style.setProperty(name, value));

  if (holiday.heading_font) {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(holiday.heading_font).replace(/%20/g, "+")}&display=swap`;
    document.head.appendChild(font);
  }

  if (holiday.favicon) {
    const icon = document.querySelector('link[rel="shortcut icon"]');
    if (icon) icon.href = emojiIcon(holiday.favicon);
  }

  document.addEventListener("DOMContentLoaded", () => decorateHolidayPage(holiday, preview));
};
