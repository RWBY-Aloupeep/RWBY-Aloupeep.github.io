// Sections of the home page arrive as they scroll into view. Elements marked
// data-reveal rise and fade in (after their --reveal-delay, set in the
// markup, so a chapter's label, title, epigraph and content follow one
// another), and a chapter marked data-reveal-glow opens a soft glow behind its
// title. All of it is styled in _home.scss and _chapter.scss.
//
// An element is reset once it is entirely below the viewport again, so
// scrolling back up and down replays it; elements left above the viewport stay
// shown. head.html adds .reveal-on to <html> before first paint (only when
// motion is allowed); this script answers with .reveal-ready.
(() => {
  const root = document.documentElement;
  root.classList.add("reveal-ready");
  if (!root.classList.contains("reveal-on")) {
    return;
  }

  const items = document.querySelectorAll("[data-reveal], [data-reveal-glow]");

  // Shown once it is a little way into the viewport.
  const show = new IntersectionObserver((records) => {
    records.forEach((record) => {
      if (record.isIntersecting) {
        record.target.classList.add("is-revealed");
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  // Reset once it has gone back out through the bottom.
  const reset = new IntersectionObserver((records) => {
    records.forEach((record) => {
      if (!record.isIntersecting && record.boundingClientRect.top > 0) {
        record.target.classList.remove("is-revealed");
      }
    });
  });

  items.forEach((item) => {
    show.observe(item);
    reset.observe(item);
  });
})();
