import "./music.js";
import "./musicbtn.js";
import "./quotes.js";
import { initPhotos } from "./photos.js";
import css1 from "../css/page1.css?inline";
import css2 from "../css/page2.css?inline";
import css3 from "../css/page3.css?inline";
import css4 from "../css/page4.css?inline";
import css5 from "../css/page5.css?inline";
import css6 from "../css/page6.css?inline";
import html1 from "../pages/page1.html?raw";
import html2 from "../pages/page2.html?raw";
import html3 from "../pages/page3.html?raw";
import html4 from "../pages/page4.html?raw";
import html5 from "../pages/page5.html?raw";
import html6 from "../pages/page6.html?raw";
import { mount as mount1 } from "./page1.js";
import { mount as mount2 } from "./page2.js";
import { mount as mount3 } from "./page3.js";
import { mount as mount4 } from "./page4.js";
import { mount as mount5 } from "./page5.js";
import { mount as mount6 } from "./page6.js";

const PAGES = {
  1: { title: "Hari ini hari apa ya? 💙", html: html1, css: [css1], mount: mount1 },
  2: { title: "Happy Birthday Sahara 💙", html: html2, css: [css2], mount: mount2 },
  3: { title: "Our moments together 💙", html: html3, css: [css2, css3], mount: mount3 },
  4: { title: "Make a wish 💙", html: html4, css: [css2, css4], mount: mount4 },
  5: { title: "Balon kata-kata 💙", html: html5, css: [css2, css5], mount: mount5 },
  6: { title: "HAPPY BIRTHDAY SAHARA 💙", html: html6, css: [css2, css6], mount: mount6 },
};

const PRELOAD = [1, 2, 3, 4, 5, 6, 7].map(n => `/assets/foto${n}.webp`);

const app = document.getElementById("app");
const secret = document.querySelector(".secret");
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const num = () => Number(location.hash.slice(2)) || 1;

let current = 0, cleanup = null, styles = [], busy = false;

function makeWipe() {
  const el = document.createElement("div");
  el.className = "wipe";
  el.setAttribute("aria-hidden", "true");
  const colors = ["#ffffff", "#bfe3ff", "#8ccbf7", "#5fb0ee"];
  let h = '<i class="edge top"></i><i class="edge bot"></i>';
  for (let i = 0; i < 16; i++) {
    h += `<b class="wh" style="left:${(Math.random() * 94).toFixed(1)}%;top:${(Math.random() * 90).toFixed(1)}%;` +
      `font-size:${(14 + Math.random() * 30).toFixed(0)}px;color:${colors[i % 4]};animation-delay:-${(Math.random() * 3).toFixed(1)}s">${i % 4 === 3 ? "✦" : "♥"}</b>`;
  }
  el.innerHTML = h + '<span class="wipe-heart">♥</span>';
  document.body.appendChild(el);
  return el;
}
const wipe = makeWipe();
const EASE = "cubic-bezier(.65,0,.35,1)";

async function cover() {
  if (reduce) { app.style.opacity = 0; await wait(400); return; }
  wipe.getAnimations().forEach(a => a.cancel());
  wipe.classList.add("on");
  await wipe.animate(
    [{ transform: "translateY(calc(100% + 70px))" }, { transform: "translateY(0)" }],
    { duration: 650, easing: EASE, fill: "forwards" }
  ).finished;
}

async function uncover() {
  if (reduce) { requestAnimationFrame(() => (app.style.opacity = 1)); return; }
  await wipe.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(calc(-100% - 70px))" }],
    { duration: 650, delay: 120, easing: EASE, fill: "forwards" }
  ).finished;
  wipe.classList.remove("on");
}

function swap(n) {
  if (cleanup) cleanup();
  styles.forEach(s => s.remove());
  const p = PAGES[n];
  styles = p.css.map(css => {
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
    return s;
  });
  app.innerHTML = p.html;
  document.title = p.title;
  document.body.dataset.page = n;
  scrollTo(0, 0);
  cleanup = p.mount(app);

  const foot = app.querySelector(".bunting.foot");
  secret.classList.toggle("on-foot", !!foot);
  if (foot) foot.before(secret);
  else document.body.appendChild(secret);

  if (n > 1) {
    const b = document.createElement("button");
    b.className = "back-btn";
    b.type = "button";
    b.setAttribute("aria-label", "Kembali ke page sebelumnya");
    b.title = "Kembali";
    b.innerHTML = "<span>&lt;</span>";
    b.addEventListener("click", () => { location.hash = "#/" + (n - 1); });
    app.appendChild(b);
  }
  current = n;
}

async function show(n) {
  if (busy || n === current) return;
  if (!PAGES[n]) {
    n = current || 1;
    history.replaceState(null, "", "#/" + n);
    if (n === current) return;
  }
  busy = true;
  const first = !current;
  if (!first) {
    if (n === 1) BdayMusic.stop();
    await cover();
  }
  swap(n);
  if (first) requestAnimationFrame(() => (app.style.opacity = 1));
  else await uncover();
  busy = false;
  if (num() !== current) show(num());
}

async function preload() {
  const bar = document.getElementById("ldBar"), pct = document.getElementById("ldPct");
  const jobs = [
    ...PRELOAD.map(src => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = src; })),
    BdayMusic.ready,
    Promise.race([document.fonts ? document.fonts.ready : 0, wait(2500)]),
    document.fonts ? document.fonts.load("600 1em Caveat") : 0,
  ];
  let n = 0;
  const bump = () => {
    const p = Math.round(++n / jobs.length * 100);
    if (bar) bar.style.setProperty("--p", p + "%");
    if (pct) pct.textContent = p + "%";
  };
  await Promise.race([
    Promise.all([wait(1400), ...jobs.map(j => Promise.resolve(j).then(bump, bump))]),
    wait(9000),
  ]);
}

initPhotos(app);
app.style.opacity = 0;
addEventListener("hashchange", () => show(num()));

preload().then(() => {
  const loader = document.getElementById("loader");
  if (loader) { loader.classList.add("done"); setTimeout(() => loader.remove(), 900); }
  show(num());
});

let armed = num() > 1;
["pointerdown", "keydown", "touchend"].forEach(ev =>
  addEventListener(ev, e => {
    if (!armed || current < 2 || (e.target.closest && e.target.closest(".music-ctl"))) return;
    armed = false;
    BdayMusic.start();
  })
);
