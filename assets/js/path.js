// The Experience timeline (_includes/path.html) lights up as it is read. An entry
// is lit while its node is above 70% of the viewport: scrolling down lights
// the nodes one by one and draws the line on to the next; scrolling back up
// retracts the line and puts them out again, from the bottom. Several entries
// changing on the same scroll (on load, or after a jump) follow one another a
// beat apart, like a line being drawn or rewound.
//
// Without JavaScript, or with reduced motion, the timeline is simply lit: the
// unlit look only applies once this script adds .is-armed.
(() => {
  const path = document.querySelector(".path");
  if (!path || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const entries = Array.from(path.querySelectorAll(".path__entry"));
  const nodes = entries.map((entry) => entry.querySelector(".path__node"));
  const LINE = 0.7; // how far down the viewport a node has to rise
  const STAGGER = 140; // ms between entries changing on the same scroll
  let lit = 0; // entries[0 .. lit - 1] are lit
  let queued = false;

  path.classList.add("is-armed");

  // How many entries, from the top, have their node above the line. They are
  // in reading order, so the first one below the line ends the count.
  const target = () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      return entries.length;
    }
    const line = window.innerHeight * LINE;
    const below = nodes.findIndex((node) => node.getBoundingClientRect().top > line);
    return below === -1 ? entries.length : below;
  };

  const update = () => {
    queued = false;
    const goal = target();
    // Down: light the next ones, top first. Up: put them out, bottom first.
    for (let step = 0; lit < goal; step += 1, lit += 1) {
      entries[lit].style.setProperty("--light-delay", `${step * STAGGER}ms`);
      entries[lit].classList.add("is-lit");
    }
    for (let step = 0; lit > goal; step += 1, lit -= 1) {
      entries[lit - 1].style.setProperty("--light-delay", `${step * STAGGER}ms`);
      entries[lit - 1].classList.remove("is-lit");
    }
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  queue();
})();
