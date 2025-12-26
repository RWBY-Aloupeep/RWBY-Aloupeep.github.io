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

  const finalLine = intro.querySelector(".home-intro__line--third");
  const dismissed = sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
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
    sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
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

  const handleFinalLineAnimationEnd = () => {
    enableDismiss();
  };

  if (finalLine) {
    finalLine.addEventListener("animationend", handleFinalLineAnimationEnd, { once: true });
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
