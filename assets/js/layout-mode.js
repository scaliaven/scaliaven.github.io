// The newspaper layout is an independent display preference, so it can be
// combined with any light/dark theme setting.
const layoutStorageKey = "layout-mode";

const determineLayoutMode = () => {
  try {
    return localStorage.getItem(layoutStorageKey) === "newspaper" ? "newspaper" : "standard";
  } catch (error) {
    return "standard";
  }
};

const updateLayoutToggle = (mode) => {
  const toggle = document.getElementById("layout-toggle");
  if (!toggle) return;

  const newspaperIsActive = mode === "newspaper";
  const nextMode = newspaperIsActive ? "standard" : "newspaper";
  const action = `Use ${nextMode} layout`;
  toggle.setAttribute("aria-pressed", String(newspaperIsActive));
  toggle.setAttribute("aria-label", action);
  toggle.setAttribute("title", action);

  const label = toggle.querySelector(".layout-toggle-label");
  if (label) label.textContent = newspaperIsActive ? "standard" : "paper";
};

const setLayoutMode = (mode, persist = true) => {
  const normalizedMode = mode === "newspaper" ? "newspaper" : "standard";
  document.documentElement.setAttribute("data-layout", normalizedMode);

  if (persist) {
    try {
      localStorage.setItem(layoutStorageKey, normalizedMode);
    } catch (error) {
      // The layout still works for this page when storage is unavailable.
    }
  }

  updateLayoutToggle(normalizedMode);
};

const toggleLayoutMode = () => {
  const currentMode = document.documentElement.getAttribute("data-layout") || determineLayoutMode();
  setLayoutMode(currentMode === "newspaper" ? "standard" : "newspaper");
};

const initLayoutMode = () => {
  setLayoutMode(determineLayoutMode(), false);

  document.addEventListener("DOMContentLoaded", () => {
    updateLayoutToggle(determineLayoutMode());

    const toggle = document.getElementById("layout-toggle");
    if (toggle) toggle.addEventListener("click", toggleLayoutMode);

    const dateline = document.querySelector("[data-newspaper-date]");
    if (dateline) {
      dateline.textContent = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date());
    }
  });
};
