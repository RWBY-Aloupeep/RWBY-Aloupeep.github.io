const INTRO_STORAGE_KEY = "homeIntroDismissed";

const getIntroDismissed = () => {
  try {
    return (
      window.localStorage.getItem(INTRO_STORAGE_KEY) === "true" ||
      window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "true"
    );
  } catch (error) {
    return false;
  }
};

const persistIntroDismissed = () => {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch (error) {}

  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch (error) {}
};

const initHomeIntro = () => {
  const intro = document.querySelector(".home-intro");
  if (!intro) {
    return;
  }

  const overlay = intro.querySelector(".home-intro__overlay");
  if (!overlay) {
    return;
  }

  const finalLine = intro.querySelector(".home-intro__line--third");
  const redirectTarget = overlay.dataset.homeIntroTarget;
  const dismissed = getIntroDismissed();
  if (dismissed) {
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-intro-active");
    document.body.classList.remove("home-intro-ready");
    return;
  }

  document.body.classList.add("home-intro-active");
  overlay.setAttribute("aria-hidden", "false");

  let canDismiss = false;
  let pendingDismiss = false;
  let dismissedNow = false;
  const dismissIntro = () => {
    if (dismissedNow) {
      return;
    }
    dismissedNow = true;
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-intro-active");
    document.body.classList.remove("home-intro-ready");
    persistIntroDismissed();
    if (redirectTarget) {
      window.location.href = redirectTarget;
      return;
    }
    overlay.removeEventListener("click", handleOverlayClick);
  };
  const handleOverlayClick = () => {
    if (!canDismiss) {
      pendingDismiss = true;
      return;
    }
    dismissIntro();
  };
  const enableDismiss = () => {
    if (canDismiss) {
      return;
    }
    canDismiss = true;
    overlay.classList.add("is-clickable");
    if (pendingDismiss) {
      dismissIntro();
    }
  };

  if (finalLine) {
    finalLine.addEventListener("animationend", enableDismiss, { once: true });
  }

  setTimeout(() => {
    document.body.classList.add("home-intro-ready");
  }, 600);

  setTimeout(enableDismiss, 4500);

  overlay.addEventListener("click", handleOverlayClick);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomeIntro);
} else {
  initHomeIntro();
}
