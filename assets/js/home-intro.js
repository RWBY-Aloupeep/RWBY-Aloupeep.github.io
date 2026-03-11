const initHomeIntro = () => {
  const intro = document.querySelector(".home-intro");
  if (!intro) {
    return;
  }

  const overlay = intro.querySelector(".home-intro__overlay");
  const content = intro.querySelector("#home-content");
  const scrollTrigger = intro.querySelector("[data-home-intro-scroll]");

  if (!overlay || !content) {
    return;
  }

  const scrollToContent = () => {
    content.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleIntroClick = (event) => {
    if (scrollTrigger && !scrollTrigger.contains(event.target)) {
      return;
    }
   scrollToContent();
  };

  overlay.addEventListener("click", handleIntroClick);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomeIntro);
} else {
  initHomeIntro();
}
