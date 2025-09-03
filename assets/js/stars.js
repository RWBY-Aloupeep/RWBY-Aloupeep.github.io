const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 8;
let mouse = { x: null, y: null, radius: 40 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  init(); // re-spawn stars inside new bounds
});

window.addEventListener("mousemove", e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

function getBounds() {
  const nav = document.querySelector("nav");       // your top nav element
  const footer = document.querySelector("footer"); // your sitemap/footer element
  const navHeight = nav ? nav.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 0;

  return {
    top: navHeight,
    bottom: canvas.height - footerHeight
  };
}

class Star {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = radius;
  }

  draw() {
    let gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius);
    gradient.addColorStop(0, "#222");
    gradient.addColorStop(1, "#000");

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  update(bounds) {
    // bounce horizontally
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.vx *= -1;
    }

    // bounce vertically but respect nav + footer
    if (this.y - this.radius < bounds.top) {
      this.y = bounds.top + this.radius;
      this.vy *= -1;
    }
    if (this.y + this.radius > bounds.bottom) {
      this.y = bounds.bottom - this.radius;
      this.vy *= -1;
    }

    // mouse repulsion
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius + this.radius) {
      let angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * 0.5;
      this.vy -= Math.sin(angle) * 0.5;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.98; // friction
    this.vy *= 0.98;

    this.draw();
  }
}

// init stars
function init() {
  stars = [];
  const bounds = getBounds();

  for (let i = 0; i < numStars; i++) {
    let radius = 12 + Math.random() * 8;

    let x = Math.random() * (canvas.width - radius * 2) + radius;

    // spawn only between nav and footer
    let y = Math.random() * (bounds.bottom - bounds.top - radius * 2) + bounds.top + radius;

    stars.push(new Star(x, y, radius));
  }
}
init();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bounds = getBounds();
  stars.forEach(s => s.update(bounds));
  requestAnimationFrame(animate);
}
animate();
