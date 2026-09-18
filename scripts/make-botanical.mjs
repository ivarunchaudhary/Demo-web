// Generates the botanical illustrations used behind the hero and footer.
// Deterministic: run `node scripts/make-botanical.mjs` to regenerate public/art/*.svg.
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

let gradId = 0;
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
    body: `<g><path d="${d}" fill="url(#${id})" stroke="#11261a" stroke-width="1.4"/><path d="${d}" fill="url(#shade)"/><path d="${rib}" fill="none" stroke="#e3edb0" stroke-opacity=".62" stroke-width="1.6"/><path d="${veins}" fill="none" stroke="#dbe8a6" stroke-opacity=".34" stroke-width="1"/></g>`,
  };
}

function flower({ x, y, r, rot, rnd }) {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = rot + (i * Math.PI * 2) / 5;
    const cx = x + Math.cos(a) * r * 0.85;
    const cy = y + Math.sin(a) * r * 0.85;
    petals += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r * 0.48)}" ry="${f(r * 0.95)}" transform="rotate(${f((a * 180) / Math.PI + 90)} ${f(cx)} ${f(cy)})" fill="url(#petal)" stroke="#2a1116" stroke-width="1"/>`;
  }
  let stamens = "";
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2;
    const d = r * 0.2 + rnd() * r * 0.25;
    stamens += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d)}" r="${f(r * 0.07)}" fill="#e3d27a"/>`;
  }
  return `<g>${petals}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.32)}" fill="#7a2a36"/>${stamens}</g>`;
}

function branch({ p0, p1, p2, p3, leaves, lenFrom, lenTo, widthFrom, widthTo, droop, rnd, side = 1, twigs = true, flowersAt = [] }) {
  const stemD = `M${f(p0[0])} ${f(p0[1])}C${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`;
  const stems = `<path d="${stemD}" fill="none" stroke="#4a3a20" stroke-width="9" stroke-linecap="round"/><path d="${stemD}" fill="none" stroke="#b8a066" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round" transform="translate(-1.5,-1.5)"/>`;
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
    // blend the outward direction toward "down" so leaves hang a little
    const ang = outward + (Math.PI / 2 - outward) * droop + (rnd() - 0.5) * 0.35;
    const k = i / (leaves - 1);
    const len = (lenFrom + (lenTo - lenFrom) * k) * (0.85 + rnd() * 0.3);
    const width = (widthFrom + (widthTo - widthFrom) * k) * (0.85 + rnd() * 0.3);
    if (twigs) {
      const tx = x + Math.cos(ang) * len * 0.22;
      const ty = y + Math.sin(ang) * len * 0.22;
      twigOut += `<path d="M${f(x)} ${f(y)}L${f(tx)} ${f(ty)}" stroke="#4a3a20" stroke-width="4" stroke-linecap="round"/>`;
      const l = leaf({ x: tx, y: ty, angle: ang, len, width, curl: (rnd() - 0.5) * 0.5 });
      defs.push(l.defs);
      bodies.push(l.body);
      outlines.push(l.outline);
    } else {
      const l = leaf({ x, y, angle: ang, len, width, curl: (rnd() - 0.5) * 0.5 });
      defs.push(l.defs);
      bodies.push(l.body);
      outlines.push(l.outline);
    }
  }
  let flowers = "";
  for (const fa of flowersAt) {
    const [x, y] = bezier(p0, p1, p2, p3, fa.t);
    const s = fa.side;
    const tan = tangent(p0, p1, p2, p3, fa.t);
    const a = tan + (s * Math.PI) / 2;
    const stalk = fa.r * 2.4;
    const fx = x + Math.cos(a) * stalk;
    const fy = y + Math.sin(a) * stalk;
    flowers += `<path d="M${f(x)} ${f(y)}Q${f(x + Math.cos(a) * stalk * 0.5 + 8)} ${f(y + Math.sin(a) * stalk * 0.5)} ${f(fx)} ${f(fy)}" fill="none" stroke="#4a3a20" stroke-width="3"/>`;
    flowers += flower({ x: fx, y: fy, r: fa.r, rot: rnd() * Math.PI, rnd });
    for (let b = 0; b < 3; b++) {
      const ba = a + (rnd() - 0.5) * 1.6;
      const bd = fa.r * (1.4 + rnd());
      flowers += `<path d="M${f(x)} ${f(y)}L${f(x + Math.cos(ba) * bd)} ${f(y + Math.sin(ba) * bd)}" stroke="#4a3a20" stroke-width="2"/><circle cx="${f(x + Math.cos(ba) * bd)}" cy="${f(y + Math.sin(ba) * bd)}" r="${f(fa.r * 0.28)}" fill="#c85a6a" stroke="#5a1f28"/>`;
    }
  }
  return { stems, twigs: twigOut, defs, bodies, outlines, flowers };
}

function svg({ w, h, parts, seed }) {
  const defs = parts.flatMap((p) => p.defs).join("");
  const outlines = parts.flatMap((p) => p.outlines).map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e7a3" stop-opacity=".34"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
<radialGradient id="petal"><stop offset="0" stop-color="#ffc2c8"/><stop offset=".6" stop-color="#e8707f"/><stop offset="1" stop-color="#9a3040"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .45"/></feComponentTransfer></filter>
<mask id="leafmask"><g fill="#fff">${outlines}</g></mask>
${defs}
</defs>
${parts.map((p) => p.stems).join("")}
${parts.map((p) => p.twigs).join("")}
${parts.flatMap((p) => p.bodies).join("")}
${parts.map((p) => p.flowers).join("")}
<rect width="${w}" height="${h}" fill="#101010" filter="url(#grain)" mask="url(#leafmask)" opacity=".22"/>
</svg>`;
}

mkdirSync("public/art", { recursive: true });

// Left cluster: a stem rising from the bottom-left, flowers low, small leaves near the top.
{
  const rnd = rng(7);
  const main = branch({
    p0: [150, 900], p1: [40, 640], p2: [430, 420], p3: [470, 60],
    leaves: 13, lenFrom: 150, lenTo: 80, widthFrom: 78, widthTo: 44, droop: 0.15, rnd,
    flowersAt: [{ t: 0.16, side: -1, r: 30 }, { t: 0.3, side: 1, r: 24 }],
  });
  const sub = branch({
    p0: [330, 520], p1: [420, 500], p2: [560, 470], p3: [690, 380],
    leaves: 7, lenFrom: 110, lenTo: 60, widthFrom: 58, widthTo: 32, droop: 0.2, rnd, side: -1,
  });
  writeFileSync("public/art/botanical-left.svg", svg({ w: 720, h: 900, parts: [sub, main], seed: 3 }));
}

// Right branch: enters from the top-right and sweeps down-left with large hanging leaves.
{
  const rnd = rng(19);
  const main = branch({
    p0: [1120, 20], p1: [930, 110], p2: [700, 320], p3: [160, 700],
    leaves: 14, lenFrom: 270, lenTo: 140, widthFrom: 130, widthTo: 70, droop: 0.4, rnd,
  });
  const sub3 = branch({
    p0: [470, 480], p1: [420, 560], p2: [380, 680], p3: [300, 880],
    leaves: 6, lenFrom: 160, lenTo: 100, widthFrom: 80, widthTo: 50, droop: 0.45, rnd, side: -1,
  });
  const sub = branch({
    p0: [760, 290], p1: [740, 420], p2: [720, 560], p3: [640, 860],
    leaves: 7, lenFrom: 170, lenTo: 100, widthFrom: 84, widthTo: 50, droop: 0.45, rnd, side: -1,
  });
  const sub2 = branch({
    p0: [980, 120], p1: [1040, 260], p2: [1010, 420], p3: [960, 620],
    leaves: 6, lenFrom: 150, lenTo: 90, widthFrom: 76, widthTo: 44, droop: 0.4, rnd,
  });
  writeFileSync("public/art/botanical-right.svg", svg({ w: 1160, h: 900, parts: [sub2, sub3, sub, main], seed: 5 }));
}
console.log("wrote public/art/botanical-left.svg and botanical-right.svg");
