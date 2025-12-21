const INTRO_STORAGE_KEY = "homeIntroDismissed";

const initHomeIntro = () => {
  const intro = document.querySelector(".home-intro");
  if (!intro) {
    return;
  }

  const overlay = intro.querySelector(".home-intro__overlay");
  if (!overlay) {
    return;
  }

  const dismissed = sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
  if (dismissed) {
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    return;
  }

  document.body.classList.add("home-intro-active");
  overlay.setAttribute("aria-hidden", "false");

  overlay.addEventListener("click", () => {
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-intro-active");
    sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
  }, { once: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomeIntro);
} else {
  initHomeIntro();
}
