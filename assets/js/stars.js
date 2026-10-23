// Stars drifting behind the whole home page: a tiny 2D physics simulation with
// elastic collisions and pointer repulsion. The stars live in page coordinates
// and scroll with the content. They steer around the text that sits on the
// page background (elements marked [data-stars-avoid]) and pass behind cards
// and photos, which hide them, so they never cover any text.
// The canvas is fixed to the viewport and only draws the stars in view.
// Colors come from the --star-* custom properties, so they follow the theme.
(() => {
  const canvas = document.querySelector("[data-stars]");
  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const avoided = document.querySelectorAll("[data-stars-avoid]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const CRUISE_SPEED = 0.35; // px per frame the stars settle back to
  const DAMPING = 0.97; // how quickly extra speed bleeds off
  const POINTER_RADIUS = 70;
  const POINTER_FORCE = 0.6;
  const GLOW = 18; // shadow blur, also how far off-screen a star still shows

  let viewWidth = 0; // the canvas, i.e. the viewport
  let viewHeight = 0;
  let width = 0; // the page, where the stars roam
  let height = 0;
  let zonePadding = 0;
  let stars = [];
  let palette = null;
  let zones = [];
  let frame = 0;
  let lastTime = 0;
  const pointer = { x: -1e4, y: -1e4 }; // in viewport coordinates

  const readPalette = () => {
    const style = getComputedStyle(document.documentElement);
    palette = {
      core: style.getPropertyValue("--star-core").trim() || "#ffffff",
      edge: style.getPropertyValue("--star-edge").trim() || "#999999",
      glow: style.getPropertyValue("--star-glow").trim() || "rgba(200, 200, 255, 0.7)",
    };
  };

  // The box around an element's visible text and icons, in page coordinates:
  // the union of its line boxes, so a short line does not claim the full width
  // of its paragraph.
  const textBox = (el) => {
    const range = document.createRange();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    const add = (rect) => {
      if (rect.width && rect.height) {
        box.left = Math.min(box.left, rect.left);
        box.top = Math.min(box.top, rect.top);
        box.right = Math.max(box.right, rect.right);
        box.bottom = Math.max(box.bottom, rect.bottom);
      }
    };
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim() && !node.parentElement.closest(".visually-hidden")) {
          range.selectNodeContents(node);
          Array.from(range.getClientRects()).forEach(add);
        }
      } else if (node.matches("svg, img")) {
        add(node.getBoundingClientRect());
      }
    }
    if (box.left === Infinity) {
      return null;
    }
    return {
      left: box.left + window.scrollX - zonePadding,
      right: box.right + window.scrollX + zonePadding,
      top: box.top + window.scrollY - zonePadding,
      bottom: box.bottom + window.scrollY + zonePadding,
    };
  };

  const measure = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    viewWidth = rect.width;
    viewHeight = rect.height;
    canvas.width = Math.round(viewWidth * ratio);
    canvas.height = Math.round(viewHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    width = document.documentElement.clientWidth;
    height = document.documentElement.scrollHeight;
    zonePadding = width < 640 ? 10 : 22;
    zones = Array.from(avoided, textBox).filter(Boolean);
  };

  const zoneAt = (x, y, r) =>
    zones.find(
      (zone) =>
        x > zone.left - r &&
        x < zone.right + r &&
        y > zone.top - r &&
        y < zone.bottom + r
    );

  // Push a star out through the nearest side of the zone it is in and point it
  // away. Sides too close to the page's edge for the star to fit are skipped,
  // or the wall bounce would push it straight back in.
  const leaveZones = (star) => {
    const zone = zoneAt(star.x, star.y, star.r);
    if (!zone) {
      return;
    }
    const sides = [
      { side: "left", d: star.x - (zone.left - star.r), room: zone.left - 2 * star.r },
      { side: "right", d: zone.right + star.r - star.x, room: width - zone.right - 2 * star.r },
      { side: "top", d: star.y - (zone.top - star.r), room: zone.top - 2 * star.r },
      { side: "bottom", d: zone.bottom + star.r - star.y, room: height - zone.bottom - 2 * star.r },
    ];
    const open = sides.filter((side) => side.room > 0);
    const exit = (open.length ? open : sides).sort((a, b) => a.d - b.d)[0];

    switch (exit.side) {
      case "left":
        star.x = zone.left - star.r - 1;
        star.vx = -Math.abs(star.vx);
        break;
      case "right":
        star.x = zone.right + star.r + 1;
        star.vx = Math.abs(star.vx);
        break;
      case "top":
        star.y = zone.top - star.r - 1;
        star.vy = -Math.abs(star.vy);
        break;
      default:
        star.y = zone.bottom + star.r + 1;
        star.vy = Math.abs(star.vy);
    }
  };

  // Keep a star on the page, bouncing it off the edges.
  const contain = (star) => {
    if (star.x < star.r || star.x > width - star.r) {
      star.vx = star.x < star.r ? Math.abs(star.vx) : -Math.abs(star.vx);
      star.x = Math.min(Math.max(star.x, star.r), width - star.r);
    }
    if (star.y < star.r || star.y > height - star.r) {
      star.vy = star.y < star.r ? Math.abs(star.vy) : -Math.abs(star.vy);
      star.y = Math.min(Math.max(star.y, star.r), height - star.r);
    }
  };

  const spawn = () => {
    // About one star per 120,000 px² of page, so a long page gets more.
    const narrow = width < 640;
    const count = Math.min(Math.max(Math.round((width * height) / 120000), 6), 28);
    stars = [];
    for (let i = 0; i < count; i += 1) {
      const r = narrow ? 7 + Math.random() * 4 : 10 + Math.random() * 6;
      // Alternate sides so the stars spread out instead of clumping.
      const leftSide = i % 2 === 0;
      const minX = leftSide ? r : width / 2 + r;
      const maxX = leftSide ? width / 2 - r : width - r;
      let x;
      let y;
      let attempts = 0;
      do {
        x = minX + Math.random() * Math.max(maxX - minX, 0);
        y = r + Math.random() * Math.max(height - 2 * r, 0);
        attempts += 1;
      } while (zoneAt(x, y, r) && attempts < 50);

      const angle = Math.random() * Math.PI * 2;
      stars.push({
        x,
        y,
        r,
        vx: Math.cos(angle) * CRUISE_SPEED,
        vy: Math.sin(angle) * CRUISE_SPEED,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.01,
      });
    }
  };

  const drawStar = (star, x, y) => {
    const outer = star.r;
    const inner = star.r * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(star.rotation);
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = (Math.PI / 5) * i;
      const radius = i % 2 === 0 ? outer : inner;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    const gradient = ctx.createRadialGradient(0, 0, inner * 0.2, 0, 0, outer);
    gradient.addColorStop(0, palette.core);
    gradient.addColorStop(1, palette.edge);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = GLOW;
    ctx.shadowColor = palette.glow;
    ctx.fill();
    ctx.restore();
  };

  // Equal-mass elastic collision: separate the pair, swap normal velocities.
  const collide = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const overlap = a.r + b.r - dist;
    if (overlap <= 0) {
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    a.x -= (nx * overlap) / 2;
    a.y -= (ny * overlap) / 2;
    b.x += (nx * overlap) / 2;
    b.y += (ny * overlap) / 2;

    const va = a.vx * nx + a.vy * ny;
    const vb = b.vx * nx + b.vy * ny;
    if (va - vb <= 0) {
      return;
    }
    a.vx += (vb - va) * nx;
    a.vy += (vb - va) * ny;
    b.vx += (va - vb) * nx;
    b.vy += (va - vb) * ny;
  };

  const step = (dt) => {
    const pointerX = pointer.x + window.scrollX;
    const pointerY = pointer.y + window.scrollY;
    for (const star of stars) {
      const dx = star.x - pointerX;
      const dy = star.y - pointerY;
      const dist = Math.hypot(dx, dy);
      const reach = POINTER_RADIUS + star.r;
      if (dist > 0 && dist < reach) {
        const push = (1 - dist / reach) * POINTER_FORCE * dt;
        star.vx += (dx / dist) * push;
        star.vy += (dy / dist) * push;
      }

      // Bleed off extra speed but never stop drifting.
      const speed = Math.hypot(star.vx, star.vy) || 0.0001;
      const target = speed > CRUISE_SPEED
        ? Math.max(CRUISE_SPEED, speed * Math.pow(DAMPING, dt))
        : speed + (CRUISE_SPEED - speed) * 0.02 * dt;
      star.vx *= target / speed;
      star.vy *= target / speed;

      star.x += star.vx * dt;
      star.y += star.vy * dt;
      star.rotation += star.spin * dt;

      contain(star);
      leaveZones(star);
    }

    for (let i = 0; i < stars.length; i += 1) {
      for (let j = i + 1; j < stars.length; j += 1) {
        collide(stars[i], stars[j]);
      }
    }
  };

  // Draw only the stars inside (or glowing into) the viewport.
  const draw = () => {
    ctx.clearRect(0, 0, viewWidth, viewHeight);
    const offsetX = window.scrollX;
    const offsetY = window.scrollY;
    for (const star of stars) {
      const x = star.x - offsetX;
      const y = star.y - offsetY;
      const reach = star.r + GLOW;
      if (y > -reach && y < viewHeight + reach && x > -reach && x < viewWidth + reach) {
        drawStar(star, x, y);
      }
    }
  };

  const tick = (time) => {
    // Normalise to 60 fps so the motion looks the same on any refresh rate.
    const dt = lastTime ? Math.min((time - lastTime) / (1000 / 60), 3) : 1;
    lastTime = time;
    step(dt);
    draw();
    frame = requestAnimationFrame(tick);
  };

  const shouldAnimate = () => !document.hidden && !reducedMotion.matches;

  const sync = () => {
    if (shouldAnimate() && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    } else if (!shouldAnimate() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (!frame) {
      draw();
    }
  };

  // Re-measure after anything that moves the text: a resize, fonts loading,
  // the hero's entrance animation finishing. Respawn on big width changes
  // (e.g. rotating a phone); otherwise keep the scene and nudge stars back out
  // of the text.
  let measureFrame = 0;
  const remeasure = () => {
    cancelAnimationFrame(measureFrame);
    measureFrame = requestAnimationFrame(() => {
      const oldWidth = width;
      measure();
      if (Math.abs(width - oldWidth) > 120) {
        spawn();
      } else {
        stars.forEach((star) => {
          contain(star);
          leaveZones(star);
        });
      }
      if (!frame) {
        draw();
      }
    });
  };

  readPalette();
  measure();
  spawn();
  sync();

  window.addEventListener("resize", remeasure);
  if ("ResizeObserver" in window) {
    new ResizeObserver(remeasure).observe(document.body);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasure);
  }
  document.addEventListener("animationend", remeasure);

  // Without animation the stars stand still, but they still scroll.
  window.addEventListener("scroll", () => {
    if (!frame) {
      draw();
    }
  }, { passive: true });

  const forgetPointer = () => {
    pointer.x = -1e4;
    pointer.y = -1e4;
  };
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", forgetPointer);
  // A finger lifting (or starting to scroll) should not keep pushing stars away.
  window.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") {
      forgetPointer();
    }
  });
  window.addEventListener("pointercancel", forgetPointer);

  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);

  new MutationObserver(() => {
    readPalette();
    if (!frame) {
      draw();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
