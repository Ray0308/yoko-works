const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    const selected = button.dataset.filter;
    projects.forEach((project) => {
      project.hidden = selected !== "all" && project.dataset.category !== selected;
    });
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelectorAll(".visual").forEach((visual) => {
  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    visual.style.setProperty("--x", `${event.clientX - rect.left}px`);
    visual.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });
});

const canvas = document.querySelector("#ambient");
const context = canvas.getContext("2d");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let ratio = 1;
let pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
let particles = [];

function resize() {
  width = innerWidth;
  height = innerHeight;
  ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(110, Math.floor(width / 11));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    ox: Math.random() * width,
    oy: Math.random() * height,
    radius: .5 + Math.random() * 1.6,
    speed: .00025 + Math.random() * .00055,
    phase: Math.random() * Math.PI * 2,
    hue: index % 3 === 0 ? 164 : index % 3 === 1 ? 245 : 310
  }));
}

function draw(time = 0) {
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = "lighter";

  particles.forEach((particle) => {
    const drift = reducedMotion ? 0 : time * particle.speed;
    particle.x = particle.ox + Math.cos(drift + particle.phase) * (18 + particle.radius * 9);
    particle.y = particle.oy + Math.sin(drift * .8 + particle.phase) * (24 + particle.radius * 8);

    if (pointer.active && !reducedMotion) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 160 && distance > 0) {
        const force = (160 - distance) / 160;
        particle.x += (dx / distance) * force * 28;
        particle.y += (dy / distance) * force * 28;
      }
    }

    const glow = context.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.radius * 7
    );
    glow.addColorStop(0, `hsla(${particle.hue}, 100%, 78%, .72)`);
    glow.addColorStop(1, `hsla(${particle.hue}, 100%, 55%, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius * 7, 0, Math.PI * 2);
    context.fill();
  });

  if (!reducedMotion) requestAnimationFrame(draw);
}

addEventListener("resize", resize);
addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
addEventListener("pointerleave", () => { pointer.active = false; });

resize();
draw();
