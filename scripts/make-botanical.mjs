// Generates the botanical illustrations used behind the hero, the status tiles and the footer.
// Deterministic: run `node scripts/make-botanical.mjs` to regenerate public/art/*.svg.
//
// Each leaf, blossom and fan is wrapped in a group that sways on its own
// (CSS animation embedded in the SVG, so it runs inside <img> too), and a few
// loose petals drift down the picture on a loop. prefers-reduced-motion stills
// everything.
import { mkdirSync, writeFileSync } from "node:fs";

const f = (n) => Number(n.toFixed(1));
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}
function tangent(p0, p1, p2, p3, t) {
  const a = bezier(p0, p1, p2, p3, Math.max(0, t - 0.01));
  const b = bezier(p0, p1, p2, p3, Math.min(1, t + 0.01));
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
const deg = (a) => f((a * 180) / Math.PI);

/** Wraps a drawing in a group that rocks around (ox, oy). */
function sway({ ox, oy, rnd, kind = "sw" }) {
  const dur = f(5.5 + rnd() * 5);
  const delay = f(-rnd() * 10);
  return (inner) =>
    `<g class="${kind}" style="transform-origin:${f(ox)}px ${f(oy)}px;animation-duration:${dur}s;animation-delay:${delay}s">${inner}</g>`;
}

let gradId = 0;

/* ---------------- Green leaf (kept from the original set) ---------------- */
function leaf({ x, y, angle, len, width, curl = 0 }) {
  const tx = x + Math.cos(angle) * len;
  const ty = y + Math.sin(angle) * len;
  const px = -Math.sin(angle);
  const py = Math.cos(angle);
  const mx = x + Math.cos(angle) * len * 0.42;
  const my = y + Math.sin(angle) * len * 0.42;
  const c1x = mx + px * width * (1 + curl);
  const c1y = my + py * width * (1 + curl);
  const c2x = mx - px * width * (1 - curl);
  const c2y = my - py * width * (1 - curl);
  const d = `M${f(x)} ${f(y)}Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)}Q${f(c2x)} ${f(c2y)} ${f(x)} ${f(y)}Z`;
  const rib = `M${f(x)} ${f(y)}Q${f(mx + px * width * curl * 0.5)} ${f(my + py * width * curl * 0.5)} ${f(tx)} ${f(ty)}`;
  let veins = "";
  const n = Math.max(5, Math.round(len / 18));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const bx = x + Math.cos(angle) * len * t;
    const by = y + Math.sin(angle) * len * t;
    const w = width * 0.5 * Math.sin(Math.PI * t) * 0.92;
    for (const side of [1, -1]) {
      const va = angle + side * 0.55;
      const wl = w * (1 + side * curl);
      veins += `M${f(bx)} ${f(by)}q${f(Math.cos(va) * wl * 0.5)} ${f(Math.sin(va) * wl * 0.5 + 2)} ${f(Math.cos(va) * wl)} ${f(Math.sin(va) * wl)}`;
    }
  }
  const id = `g${gradId++}`;
  return {
    defs: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x)}" y1="${f(y)}" x2="${f(tx)}" y2="${f(ty)}"><stop offset="0" stop-color="#9ccc6f"/><stop offset=".45" stop-color="#5c9447"/><stop offset="1" stop-color="#22462a"/></linearGradient>`,
    outline: d,
    body: `<path d="${d}" fill="url(#${id})" stroke="#11261a" stroke-width="1.4"/><path d="${d}" fill="url(#shade)"/><path d="${rib}" fill="none" stroke="#e3edb0" stroke-opacity=".62" stroke-width="1.6"/><path d="${veins}" fill="none" stroke="#dbe8a6" stroke-opacity=".34" stroke-width="1"/>`,
  };
}

/* ---------------- Momiji: a pink-red Japanese maple leaf ---------------- */
function maple({ x, y, angle, len, rnd }) {
  // Seven lobes fanning from the stalk tip; each lobe a tapered spike with a
  // saw-toothed edge, drawn in local space then rotated into place.
  const lobes = 7;
  const spread = Math.PI * 1.15;
  let d = `M0 0`;
  const pts = [];
  for (let i = 0; i < lobes; i++) {
    const a = -spread / 2 + (spread * i) / (lobes - 1);
    const l = len * (0.55 + 0.45 * Math.cos(a * 0.9)) * (0.92 + rnd() * 0.16);
    pts.push([a, l]);
  }
  for (let i = 0; i < lobes; i++) {
    const [a, l] = pts[i];
    const tipx = Math.cos(a) * l;
    const tipy = Math.sin(a) * l;
    const wa = 0.16;
    const lx = Math.cos(a - wa) * l * 0.55;
    const ly = Math.sin(a - wa) * l * 0.55;
    const rx = Math.cos(a + wa) * l * 0.55;
    const ry = Math.sin(a + wa) * l * 0.55;
    const notch = i < lobes - 1 ? (() => {
      const [na, nl] = pts[i + 1];
      const ma = (a + na) / 2;
      const ml = Math.min(l, nl) * 0.42;
      return [Math.cos(ma) * ml, Math.sin(ma) * ml];
    })() : null;
    d += `L${f(lx)} ${f(ly)}Q${f(tipx * 0.86)} ${f(tipy * 0.86)} ${f(tipx)} ${f(tipy)}Q${f(tipx * 0.86)} ${f(tipy * 0.86)} ${f(rx)} ${f(ry)}`;
    if (notch) d += `L${f(notch[0])} ${f(notch[1])}`;
  }
  d += "Z";
  let veins = "";
  for (const [a, l] of pts) veins += `M0 0L${f(Math.cos(a) * l * 0.92)} ${f(Math.sin(a) * l * 0.92)}`;
  const id = `g${gradId++}`;
  const tr = `translate(${f(x)} ${f(y)}) rotate(${deg(angle)})`;
  return {
    defs: `<radialGradient id="${id}" cx="0" cy="0" r="${f(len)}" gradientUnits="userSpaceOnUse" gradientTransform="${tr}"><stop offset="0" stop-color="#ffd0dc"/><stop offset=".5" stop-color="#f48aa6"/><stop offset="1" stop-color="#c2405f"/></radialGradient>`,
    body: `<g transform="${tr}"><path d="${d}" fill="url(#${id})" stroke="#7a2140" stroke-width="1.2" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="#ffd9e0" stroke-opacity=".55" stroke-width="1.1"/></g>`,
  };
}

/* ---------------- Ginkgo: a warm fan with a split ---------------- */
function ginkgo({ x, y, angle, len, rnd }) {
  const w = len * (0.95 + rnd() * 0.2);
  const d = `M0 0C${f(len * 0.25)} ${f(-w * 0.12)} ${f(len * 0.7)} ${f(-w * 0.5)} ${f(len)} ${f(-w * 0.42)}Q${f(len * 1.05)} ${f(-w * 0.12)} ${f(len * 0.92)} ${f(-w * 0.02)}Q${f(len * 0.86)} 0 ${f(len * 0.92)} ${f(w * 0.02)}Q${f(len * 1.05)} ${f(w * 0.12)} ${f(len)} ${f(w * 0.42)}C${f(len * 0.7)} ${f(w * 0.5)} ${f(len * 0.25)} ${f(w * 0.12)} 0 0Z`;
  let veins = "";
  for (let i = -5; i <= 5; i++) {
    const a = (i / 5) * 0.42;
    veins += `M0 0Q${f(len * 0.5)} ${f(Math.sin(a) * w * 0.28)} ${f(Math.cos(a) * len * 0.96)} ${f(Math.sin(a) * w * 0.9)}`;
  }
  const id = `g${gradId++}`;
  const tr = `translate(${f(x)} ${f(y)}) rotate(${deg(angle)})`;
  return {
    defs: `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b6c25a"/><stop offset=".6" stop-color="#e2cf68"/><stop offset="1" stop-color="#f1e29a"/></linearGradient>`,
    body: `<g transform="${tr}"><path d="${d}" fill="url(#${id})" stroke="#6b5a15" stroke-width="1.2" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="#fff6c2" stroke-opacity=".6" stroke-width=".9"/></g>`,
  };
}

/* ---------------- Sakura: notched five-petal blossoms in clusters ---------------- */
function petalPath(r) {
  // Heart-notched petal pointing along +y in local space.
  return `M0 0C${f(-r * 0.55)} ${f(-r * 0.05)} ${f(-r * 0.62)} ${f(-r * 0.85)} ${f(-r * 0.2)} ${f(-r)}Q0 ${f(-r * 0.86)} ${f(r * 0.2)} ${f(-r)}C${f(r * 0.62)} ${f(-r * 0.85)} ${f(r * 0.55)} ${f(-r * 0.05)} 0 0Z`;
}
function blossom({ x, y, r, rot, rnd, open = 1 }) {
  let petals = "";
  const pr = r * open;
  for (let i = 0; i < 5; i++) {
    const a = rot + (i * Math.PI * 2) / 5;
    petals += `<path d="${petalPath(pr)}" transform="rotate(${deg(a + Math.PI / 2)})" fill="url(#sakura)" stroke="#a83a58" stroke-opacity=".7" stroke-width=".9"/>`;
  }
  let stamens = "";
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = pr * (0.18 + rnd() * 0.3);
    stamens += `<path d="M0 0L${f(Math.cos(a) * d)} ${f(Math.sin(a) * d)}" stroke="#c9405f" stroke-width=".8"/><circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(pr * 0.06)}" fill="#f4d35e"/>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)})">${petals}<circle r="${f(pr * 0.12)}" fill="#d94b6b"/>${stamens}</g>`;
}
function bud({ x, y, r }) {
  return `<g transform="translate(${f(x)} ${f(y)})"><ellipse rx="${f(r * 0.5)}" ry="${f(r * 0.75)}" fill="#e9748f" stroke="#8e2038" stroke-width=".9"/><path d="M${f(-r * 0.45)} ${f(r * 0.2)}Q0 ${f(r * 0.9)} ${f(r * 0.45)} ${f(r * 0.2)}" fill="#6b8f4e" stroke="#2f4d26" stroke-width=".8"/></g>`;
}

/** A cluster of blossoms hung from a point on the branch, each on a short stalk. */
function sakuraCluster({ x, y, angle, r, rnd }) {
  const n = 2 + Math.floor(rnd() * 3);
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = angle + (rnd() - 0.5) * 1.5;
    const d = r * (0.9 + rnd() * 1.3);
    const bx = x + Math.cos(a) * d;
    const by = y + Math.sin(a) * d;
    const stalk = `<path d="M${f(x)} ${f(y)}Q${f((x + bx) / 2 + 4)} ${f((y + by) / 2)} ${f(bx)} ${f(by)}" fill="none" stroke="#3b2a26" stroke-width="2.2" stroke-linecap="round"/>`;
    const isBud = rnd() < 0.22;
    const inner = isBud ? bud({ x: bx, y: by, r: r * 0.9 }) : blossom({ x: bx, y: by, r: r * (1.05 + rnd() * 0.5), rot: rnd() * Math.PI, rnd, open: 0.85 + rnd() * 0.15 });
    out += sway({ ox: x, oy: y, rnd, kind: "bl" })(stalk + inner);
  }
  return out;
}

/* ---------------- Branch ---------------- */
function branch({ p0, p1, p2, p3, leaves, lenFrom, lenTo, widthFrom, widthTo, droop, rnd, side = 1, twigs = true, kind = "green", blossomsAt = [], stem = "olive" }) {
  const stemD = `M${f(p0[0])} ${f(p0[1])}C${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`;
  const bark = stem === "sakura" ? ["#3b2a26", "#8a6b5a"] : ["#4a3a20", "#b8a066"];
  const stems = `<path d="${stemD}" fill="none" stroke="${bark[0]}" stroke-width="9" stroke-linecap="round"/><path d="${stemD}" fill="none" stroke="${bark[1]}" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round" transform="translate(-1.5,-1.5)"/>`;
  const defs = [];
  const bodies = [];
  const outlines = [];
  let twigOut = "";
  for (let i = 0; i < leaves; i++) {
    const t = 0.06 + (i / (leaves - 1)) * 0.9;
    const [x, y] = bezier(p0, p1, p2, p3, t);
    const tan = tangent(p0, p1, p2, p3, t);
    const s = (i % 2 === 0 ? 1 : -1) * side;
    const outward = tan + (s * Math.PI) / 2;
    const ang = outward + (Math.PI / 2 - outward) * droop + (rnd() - 0.5) * 0.35;
    const k = i / (leaves - 1);
    const len = (lenFrom + (lenTo - lenFrom) * k) * (0.85 + rnd() * 0.3);
    const width = (widthFrom + (widthTo - widthFrom) * k) * (0.85 + rnd() * 0.3);
    const tx = twigs ? x + Math.cos(ang) * len * 0.22 : x;
    const ty = twigs ? y + Math.sin(ang) * len * 0.22 : y;
    if (twigs) twigOut += `<path d="M${f(x)} ${f(y)}L${f(tx)} ${f(ty)}" stroke="${bark[0]}" stroke-width="4" stroke-linecap="round"/>`;
    const pick = typeof kind === "function" ? kind(i, rnd) : kind;
    const l =
      pick === "maple"
        ? maple({ x: tx, y: ty, angle: ang, len: len * 0.7, rnd })
        : pick === "ginkgo"
          ? ginkgo({ x: tx, y: ty, angle: ang, len: len * 0.75, rnd })
          : leaf({ x: tx, y: ty, angle: ang, len, width, curl: (rnd() - 0.5) * 0.5 });
    defs.push(l.defs);
    bodies.push(sway({ ox: x, oy: y, rnd })(l.body));
    if (l.outline) outlines.push(l.outline);
  }
  let flowers = "";
  for (const fa of blossomsAt) {
    const [x, y] = bezier(p0, p1, p2, p3, fa.t);
    const tan = tangent(p0, p1, p2, p3, fa.t);
    const a = tan + (fa.side * Math.PI) / 2;
    flowers += sakuraCluster({ x, y, angle: a, r: fa.r, rnd });
  }
  return { stems, twigs: twigOut, defs, bodies, outlines, flowers };
}

/* ---------------- Loose petals drifting through the picture ---------------- */
function driftingPetals({ w, h, n, rnd }) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = rnd() * w;
    const r = 9 + rnd() * 9;
    const dur = f(9 + rnd() * 8);
    const delay = f(-rnd() * 17);
    const sx = f((rnd() - 0.5) * 120);
    out += `<g class="pt" style="--x:${f(x)}px;--sx:${sx}px;--h:${h}px;animation-duration:${dur}s;animation-delay:${delay}s"><path d="${petalPath(r)}" transform="rotate(${f(rnd() * 360)})" fill="url(#sakura)" stroke="#a83a58" stroke-opacity=".5" stroke-width=".8"/></g>`;
  }
  return out;
}

function svg({ w, h, parts, seed, petals = 7, rnd }) {
  const defs = parts.flatMap((p) => p.defs).join("");
  const outlines = parts.flatMap((p) => p.outlines).map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<style>
.sw,.bl,.pt{transform-box:view-box;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.sw{animation-name:sw}
.bl{animation-name:bl}
.pt{animation-name:pt;animation-timing-function:linear;transform-origin:0 0}
@keyframes sw{0%,100%{transform:rotate(-1.8deg)}50%{transform:rotate(2.2deg)}}
@keyframes bl{0%,100%{transform:rotate(-3deg) scale(1)}50%{transform:rotate(3.5deg) scale(1.03)}}
@keyframes pt{0%{transform:translate(var(--x),-40px) rotate(0deg);opacity:0}8%{opacity:.95}92%{opacity:.9}100%{transform:translate(calc(var(--x) + var(--sx)),var(--h)) rotate(540deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.sw,.bl,.pt{animation:none}.pt{display:none}}
</style>
<defs>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e7a3" stop-opacity=".34"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
<radialGradient id="sakura" cx=".5" cy=".85" r=".9"><stop offset="0" stop-color="#e86a8c"/><stop offset=".35" stop-color="#f7a6bd"/><stop offset="1" stop-color="#ffe1ea"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .45"/></feComponentTransfer></filter>
<mask id="leafmask"><g fill="#fff">${outlines}</g></mask>
${defs}
</defs>
${parts.map((p) => p.stems).join("")}
${parts.map((p) => p.twigs).join("")}
${parts.flatMap((p) => p.bodies).join("")}
${parts.map((p) => p.flowers).join("")}
<rect width="${w}" height="${h}" fill="#101010" filter="url(#grain)" mask="url(#leafmask)" opacity=".16"/>
${driftingPetals({ w, h, n: petals, rnd })}
</svg>`;
}

mkdirSync("public/art", { recursive: true });

// Left cluster: a maple stem rising from the bottom-left, ginkgo fans on the
// side shoot, a sakura spray low down.
{
  const rnd = rng(7);
  const main = branch({
    p0: [150, 900], p1: [40, 640], p2: [430, 420], p3: [470, 60],
    leaves: 13, lenFrom: 170, lenTo: 90, widthFrom: 78, widthTo: 44, droop: 0.15, rnd,
    kind: (i) => (i % 4 === 3 ? "green" : "maple"),
    blossomsAt: [{ t: 0.16, side: -1, r: 26 }, { t: 0.3, side: 1, r: 22 }, { t: 0.72, side: -1, r: 20 }],
  });
  const sub = branch({
    p0: [330, 520], p1: [420, 500], p2: [560, 470], p3: [690, 380],
    leaves: 7, lenFrom: 120, lenTo: 70, widthFrom: 58, widthTo: 32, droop: 0.2, rnd, side: -1,
    kind: "ginkgo",
  });
  writeFileSync("public/art/botanical-left.svg", svg({ w: 720, h: 900, parts: [sub, main], seed: 3, petals: 8, rnd }));
}

// Right branch: a cherry bough entering from the top-right and sweeping
// down-left, blossom clusters along its length, with hanging green leaves and a
// maple shoot for contrast.
{
  const rnd = rng(19);
  const main = branch({
    p0: [1120, 20], p1: [930, 110], p2: [700, 320], p3: [160, 700],
    leaves: 12, lenFrom: 210, lenTo: 110, widthFrom: 100, widthTo: 56, droop: 0.4, rnd,
    stem: "sakura",
    kind: (i) => (i % 3 === 1 ? "maple" : "green"),
    blossomsAt: [
      { t: 0.1, side: 1, r: 30 }, { t: 0.2, side: -1, r: 28 }, { t: 0.33, side: 1, r: 32 },
      { t: 0.46, side: -1, r: 30 }, { t: 0.6, side: 1, r: 28 }, { t: 0.74, side: -1, r: 30 },
      { t: 0.88, side: 1, r: 26 },
    ],
  });
  const sub3 = branch({
    p0: [470, 480], p1: [420, 560], p2: [380, 680], p3: [300, 880],
    leaves: 6, lenFrom: 160, lenTo: 100, widthFrom: 80, widthTo: 50, droop: 0.45, rnd, side: -1,
    stem: "sakura", kind: "maple",
    blossomsAt: [{ t: 0.4, side: 1, r: 24 }, { t: 0.8, side: -1, r: 22 }],
  });
  const sub = branch({
    p0: [760, 290], p1: [740, 420], p2: [720, 560], p3: [640, 860],
    leaves: 7, lenFrom: 170, lenTo: 100, widthFrom: 84, widthTo: 50, droop: 0.45, rnd, side: -1,
    kind: "green",
  });
  const sub2 = branch({
    p0: [980, 120], p1: [1040, 260], p2: [1010, 420], p3: [960, 620],
    leaves: 6, lenFrom: 150, lenTo: 90, widthFrom: 76, widthTo: 44, droop: 0.4, rnd,
    kind: "ginkgo", stem: "sakura",
    blossomsAt: [{ t: 0.25, side: -1, r: 26 }, { t: 0.65, side: 1, r: 24 }],
  });
  writeFileSync("public/art/botanical-right.svg", svg({ w: 1160, h: 900, parts: [sub2, sub3, sub, main], seed: 5, petals: 10, rnd }));
}
console.log("wrote public/art/botanical-left.svg and botanical-right.svg");
