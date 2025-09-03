const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 15;
let mouse = { x: null, y: null, radius: 10 };

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
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.5, "#c0c0c0");
  gradient.addColorStop(1, "#808080");

  ctx.fillStyle = gradient;
  ctx.fill();
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
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    stars.push(new Star(x, y, radius));
  }
}
init();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => s.update());
  requestAnimationFrame(animate);
}
animate();
