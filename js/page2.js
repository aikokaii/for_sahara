
const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const BLUES = ["#bfe3ff", "#8ccbf7", "#5fb0ee", "#3f95dd"];
const FLAGS = ["#8ccbf7", "#5fb0ee", "#3f95dd", "#ffffff"];
const add = (parent, cls, css, text) => {
  const el = document.createElement("i");
  el.className = cls; el.style.cssText = css;
  if (text) el.textContent = text;
  parent.appendChild(el); return el;
};

const HEART = '<svg viewBox="0 0 200 180"><path pathLength="100" d="M100 165C40 120 10 85 10 55C10 28 32 12 55 12C75 12 92 24 100 40C108 24 125 12 145 12C168 12 190 28 190 55C190 85 160 120 100 165L100 142C57 110 33 84 33 58C33 40 47 29 63 29C78 29 92 38 100 50C108 38 122 29 137 29C153 29 167 40 167 58C167 84 143 110 100 142"/></svg>';

export function burst(x, y) {
  for (let i = 0; i < 46; i++) {
    const c = add(document.body, "confetti",
      `left:${x}px;top:${y}px;--c:${pick([...BLUES, "#fff", "#ffe08a", "#ffc2d1"])};--x:${rand(-170, 170)}px;--up:${rand(-260, -90)}px`);
    setTimeout(() => c.remove(), 2600);
  }
}

export function mount(root, heart = HEART) {
  const ac = new AbortController();
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let nav;
  root.querySelectorAll(".draw").forEach(el => (el.innerHTML = heart));

  for (const id of ["bunting", "buntingFoot"])
    for (let i = 0; i < Math.ceil(innerWidth / 38); i++)
      add($(id), "", `border-top-color:${FLAGS[i % 4]};animation-delay:-${(i * 0.3).toFixed(1)}s`);

  const deco = $("deco");
  for (let i = 0; i < 7; i++)
    add(deco, "balloon", `left:${rand(3, 92)}%;--c:${pick(BLUES)};--dur:${rand(22, 34)}s;--delay:-${rand(0, 30)}s;--s:${rand(0.7, 1.1)}`);
  for (let i = 0; i < 14; i++)
    add(deco, "spark", `left:${rand(2, 96)}%;top:${rand(4, 94)}%;font-size:${rand(10, 22)}px;--delay:-${rand(0, 4)}s;color:${pick(BLUES)}`, "✦");

  const queue = [];
  let typing = false;
  const type = () => {
    if (typing || !queue.length) return;
    typing = true;
    const b = queue.shift();
    const dots = document.createElement("div");
    dots.className = "typing";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<i></i><i></i><i></i>";
    dots.style.top = b.offsetTop + "px";
    if ([...b.parentNode.children].filter(el => el.tagName === b.tagName).indexOf(b) % 2) dots.classList.add("r");
    b.parentNode.appendChild(dots);
    later(() => {
      dots.remove();
      b.classList.add("in");
      typing = false;
      later(type, 220);
    }, Math.min(1300, 500 + b.textContent.length * 6));
  };

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (reduce || !e.target.classList.contains("bubble")) return e.target.classList.add("in");
    queue.push(e.target);
    queue.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    type();
  }), { threshold: 0.25 });
  root.querySelectorAll(".reveal").forEach(el => io.observe(el));

  const gift = $("gift");
  gift?.addEventListener("click", () => {
    const r = gift.getBoundingClientRect();
    gift.classList.add("open");
    $("tip").textContent = "SURPRISE!! 🎉";
    burst(r.left + r.width / 2, r.top);
    if (!nav && gift.dataset.next) nav = setTimeout(() => { nav = 0; location.hash = gift.dataset.next; }, 2000);
  }, { signal: ac.signal });

  addEventListener("pointerdown", e => {
    if (e.target.closest("#gift, .cake, .music-ctl, .back-btn, .lightbox, .car-btn, .scratch")) return;
    const h = add(document.body, "pop", `left:${e.clientX - 10}px;top:${e.clientY - 12}px;--x:${rand(-24, 24)}px`, "♥");
    setTimeout(() => h.remove(), 1400);
  }, { signal: ac.signal });

  return () => {
    ac.abort(); io.disconnect(); clearTimeout(nav); timers.forEach(clearTimeout);
    document.querySelectorAll(".confetti, .pop").forEach(el => el.remove());
  };
}
