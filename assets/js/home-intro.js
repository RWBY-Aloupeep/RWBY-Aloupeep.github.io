const initHomeIntro = () => {
  const intro = document.querySelector(".home-intro");
  if (!intro) {
    return;
  }

  const overlay = intro.querySelector(".home-intro__overlay");
  const content = intro.querySelector("#home-content");

  if (!overlay || !content) {
    return;
  }

  const scrollToContent = () => {
    content.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const isInteractiveElement = (target) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest("a, button, input, textarea, select, summary"));
  };

  overlay.addEventListener("click", (event) => {
    if (isInteractiveElement(event.target)) {
      return;
    }
    scrollToContent();
  });

  overlay.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    scrollToContent();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomeIntro);
} else {
  initHomeIntro();
}
