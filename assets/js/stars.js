const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 10;
let mouse = { x: null, y: null, radius: 8 };
const exclusionZone = { widthRatio: 0.4, heightRatio: 0.4 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

function drawStar(ctx, x, y, r, points = 5) {
  let outerRadius = r;
  let innerRadius = r * 0.5;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    let angle = (Math.PI / points) * i;
    let radius = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();

  // shiny silver gradient
  let gradient = ctx.createRadialGradient(x, y, innerRadius * 0.2, x, y, outerRadius);
  gradient.addColorStop(0, "#c0c0c0");
  gradient.addColorStop(0.5, "#a0a0a0ff");
  gradient.addColorStop(1, "#808080");

  // add glowing effect
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(200, 200, 255, 0.8)";

  ctx.fillStyle = gradient;
  ctx.fill();

  // reset shadow for next shapes
  ctx.shadowBlur = 0;
}

function resolveCollision(s1, s2) {
  const dx = s2.x - s1.x;
  const dy = s2.y - s1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < s1.radius + s2.radius) {
    // simple elastic collision
    const angle = Math.atan2(dy, dx);

    // separate stars so they don’t overlap
    const overlap = s1.radius + s2.radius - dist;
    const moveX = Math.cos(angle) * overlap / 2;
    const moveY = Math.sin(angle) * overlap / 2;

    s1.x -= moveX;
    s1.y -= moveY;
    s2.x += moveX;
    s2.y += moveY;

    // swap velocities (1D elastic along angle)
    const v1 = s1.vx * Math.cos(angle) + s1.vy * Math.sin(angle);
    const v2 = s2.vx * Math.cos(angle) + s2.vy * Math.sin(angle);

    const temp = v1;
    s1.vx += (v2 - v1) * Math.cos(angle);
    s1.vy += (v2 - v1) * Math.sin(angle);
    s2.vx += (temp - v2) * Math.cos(angle);
    s2.vy += (temp - v2) * Math.sin(angle);
  }
}

function getExclusionRect(padding = 0) {
  const width = canvas.width * exclusionZone.widthRatio;
  const height = canvas.height * exclusionZone.heightRatio;
  const left = (canvas.width - width) / 2 - padding;
  const right = (canvas.width + width) / 2 + padding;
  const top = (canvas.height - height) / 2 - padding;
  const bottom = (canvas.height + height) / 2 + padding;

  return { left, right, top, bottom };
}

function isInExclusionZone(x, y, radius = 0) {
  const rect = getExclusionRect(radius);
  return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function pushOutOfExclusion(star) {
  if (!isInExclusionZone(star.x, star.y, star.radius)) {
    return;
  }

  const rect = getExclusionRect(star.radius);
  const distances = [
    { edge: "left", distance: Math.abs(star.x - rect.left) },
    { edge: "right", distance: Math.abs(rect.right - star.x) },
    { edge: "top", distance: Math.abs(star.y - rect.top) },
    { edge: "bottom", distance: Math.abs(rect.bottom - star.y) },
  ];
  distances.sort((a, b) => a.distance - b.distance);
  const nearest = distances[0].edge;

  if (nearest === "left") {
    star.x = rect.left - 1;
    star.vx = -Math.abs(star.vx);
  } else if (nearest === "right") {
    star.x = rect.right + 1;
    star.vx = Math.abs(star.vx);
  } else if (nearest === "top") {
    star.y = rect.top - 1;
    star.vy = -Math.abs(star.vy);
  } else {
    star.y = rect.bottom + 1;
    star.vy = Math.abs(star.vy);
  }
}

class Star {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = radius;
    this.rotation = Math.random() * Math.PI * 2; // start rotation
    this.rotationSpeed = (Math.random() - 0.5) * 0.02; // small spin
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    drawStar(ctx, 0, 0, this.radius, 5);
    ctx.restore();
  }

  update() {
    this.rotation += this.rotationSpeed;
    // bounce off edges
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.vx *= -1;
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.vy *= -1;
    }

    // mouse collision physics
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius + this.radius) {
      // simple repulsion
      let angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * 0.5;
      this.vy -= Math.sin(angle) * 0.5;
    }

    this.x += this.vx;
    this.y += this.vy;

    pushOutOfExclusion(this);

    this.vx *= 0.98; // friction
    this.vy *= 0.98;

    this.draw();
  }
}

// init stars
function init() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    let radius = 12 + Math.random() * 8;
    let x = 0;
    let y = 0;
    let attempts = 0;
    do {
      x = Math.random() * (canvas.width - radius * 2) + radius;
      y = Math.random() * (canvas.height - radius * 2) + radius;
      attempts += 1;
    } while (isInExclusionZone(x, y, radius) && attempts < 50);
    stars.push(new Star(x, y, radius));
  }
}
init();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => s.update());
  // check pairwise collisions
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      resolveCollision(stars[i], stars[j]);
    }
  }
  requestAnimationFrame(animate);
}
animate();
