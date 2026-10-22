// Stars floating behind the home page hero: a tiny 2D physics simulation with
// elastic collisions, pointer repulsion, and no-fly zones around the elements
// marked [data-stars-avoid] (the hero text).
// Colors come from the --star-* custom properties, so they follow the theme.
(() => {
  const hero = document.querySelector("[data-hero]");
  const canvas = hero && hero.querySelector("[data-stars]");
  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const avoided = hero.querySelectorAll("[data-stars-avoid]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const CRUISE_SPEED = 0.35; // px per frame the stars settle back to
  const DAMPING = 0.97; // how quickly extra speed bleeds off
  const POINTER_RADIUS = 70;
  const POINTER_FORCE = 0.6;
  const ZONE_PADDING = 28;

  let width = 0;
  let height = 0;
  let stars = [];
  let palette = null;
  let zones = [];
  let frame = 0;
  let lastTime = 0;
  let onScreen = true;
  const pointer = { x: -1e4, y: -1e4 };

  const readPalette = () => {
    const style = getComputedStyle(document.documentElement);
    palette = {
      core: style.getPropertyValue("--star-core").trim() || "#ffffff",
      edge: style.getPropertyValue("--star-edge").trim() || "#999999",
      glow: style.getPropertyValue("--star-glow").trim() || "rgba(200, 200, 255, 0.7)",
    };
  };

  const measure = () => {
    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Offsets (the hero is their offset parent) rather than bounding boxes,
    // so the entrance animation's slide does not shift the zones.
    zones = Array.from(avoided, (el) => ({
      left: el.offsetLeft - ZONE_PADDING,
      right: el.offsetLeft + el.offsetWidth + ZONE_PADDING,
      top: el.offsetTop - ZONE_PADDING,
      bottom: el.offsetTop + el.offsetHeight + ZONE_PADDING,
    }));
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
  // away. Sides too close to the hero's edge for the star to fit are skipped,
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

  const spawn = () => {
    // The hero is a short band, so only a few, smaller stars.
    const count = width < 640 ? 4 : 7;
    stars = [];
    for (let i = 0; i < count; i += 1) {
      const r = (width < 640 ? 8 : 10) + Math.random() * 6;
      // Alternate sides so the stars frame the text instead of clumping.
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

  const drawStar = (star) => {
    const outer = star.r;
    const inner = star.r * 0.5;
    ctx.save();
    ctx.translate(star.x, star.y);
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
    ctx.shadowBlur = 18;
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
    for (const star of stars) {
      const dx = star.x - pointer.x;
      const dy = star.y - pointer.y;
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

      if (star.x < star.r || star.x > width - star.r) {
        star.vx = star.x < star.r ? Math.abs(star.vx) : -Math.abs(star.vx);
        star.x = Math.min(Math.max(star.x, star.r), width - star.r);
      }
      if (star.y < star.r || star.y > height - star.r) {
        star.vy = star.y < star.r ? Math.abs(star.vy) : -Math.abs(star.vy);
        star.y = Math.min(Math.max(star.y, star.r), height - star.r);
      }

      leaveZones(star);
    }

    for (let i = 0; i < stars.length; i += 1) {
      for (let j = i + 1; j < stars.length; j += 1) {
        collide(stars[i], stars[j]);
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(drawStar);
  };

  const tick = (time) => {
    // Normalise to 60 fps so the motion looks the same on any refresh rate.
    const dt = lastTime ? Math.min((time - lastTime) / (1000 / 60), 3) : 1;
    lastTime = time;
    step(dt);
    draw();
    frame = requestAnimationFrame(tick);
  };

  const shouldAnimate = () => onScreen && !document.hidden && !reducedMotion.matches;

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

  const reset = () => {
    measure();
    spawn();
    draw();
  };

  readPalette();
  reset();
  sync();

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const oldWidth = width;
      measure();
      // Respawn on big layout changes (e.g. rotation); otherwise keep the scene.
      if (Math.abs(width - oldWidth) > 120) {
        spawn();
      }
      draw();
    });
  });

  // Fonts change the text box size once they load.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measure();
      stars.forEach(leaveZones);
      draw();
    });
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  hero.addEventListener("pointerleave", () => {
    pointer.x = -1e4;
    pointer.y = -1e4;
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      sync();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);

  new MutationObserver(() => {
    readPalette();
    if (!frame) {
      draw();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
