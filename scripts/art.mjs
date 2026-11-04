// Code-drawn artwork for the home page. Everything is deterministic, so regenerating
// the page never changes the output unless these definitions change.
const W = 400, H = 225;
const round = n => Math.round(n * 10) / 10;
const random = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

// Catmull-Rom spline through the points, as cubic Bézier segments.
const smooth = (points, tension = 6) => points.reduce((d, [x, y], i) => {
  if (!i) return `M${x} ${y}`;
  const a = points[Math.max(i - 2, 0)], b = points[i - 1], c = points[Math.min(i + 1, points.length - 1)];
  return `${d}C${round(b[0] + (x - a[0]) / tension)} ${round(b[1] + (y - a[1]) / tension)} ${round(x - (c[0] - b[0]) / tension)} ${round(y - (c[1] - b[1]) / tension)} ${x} ${y}`;
}, '');

const lines = edges => edges.map(([a, b]) => `M${round(a[0])} ${round(a[1])}L${round(b[0])} ${round(b[1])}`).join('');
// A zero-length line with a round cap draws a dot; many of them fit in one compact path.
const dots = nodes => nodes.map(([x, y]) => `M${round(x)} ${round(y)}h0`).join('');

const nearestEdges = (nodes, count) => {
  const edges = new Map();
  nodes.forEach((a, i) => nodes
    .map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j])
    .filter(([, j]) => j !== i)
    .sort((x, y) => x[0] - y[0])
    .slice(0, count)
    .forEach(([, j]) => edges.set(`${Math.min(i, j)}-${Math.max(i, j)}`, [a, nodes[j]])));
  return [...edges.values()];
};

// The surrounding graph: a jittered grid so nodes spread evenly without looking regular.
const field = (seed, keep = () => true) => {
  const next = random(seed), nodes = [];
  for (let x = 12; x < W; x += 42) for (let y = 10; y < H; y += 38) {
    const node = [x + next() * 30 - 15, y + next() * 28 - 14];
    if (next() > .22 && keep(node)) nodes.push(node);
  }
  return `<path class="ca-edge" d="${lines(nearestEdges(nodes, 2))}"/><path class="ca-node" d="${dots(nodes)}"/>`;
};

const lit = ([x, y], size = 3.2) => `<circle class="ca-halo" cx="${x}" cy="${y}" r="${round(size * 2.5)}"/><circle class="ca-core" cx="${x}" cy="${y}" r="${size}"/>`;
const source = ([x, y]) => `<circle class="ca-glow" cx="${x}" cy="${y}" r="20"/><circle class="ca-halo" cx="${x}" cy="${y}" r="12"/>${lit([x, y], 4.6)}`;
const label = ([x, y], text, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
const status = text => `<text class="ca-status" x="14" y="${H - 13}">${text}</text>`;
const svg = body => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
const trace = d => `<path class="ca-trace-glow" d="${d}"/><path class="ca-trace" d="${d}"/>`;

// 01 A single lit route through a graph, from the internet to an assumable role.
const exposed = () => {
  const route = [[44, 146], [126, 114], [214, 128], [294, 72], [358, 48]];
  const branches = [[route[1], [176, 176]], [[176, 176], [252, 188]], [route[2], [288, 158]], [route[3], [344, 112]]];
  return svg(field(11, ([x, y]) => route.every(p => Math.hypot(x - p[0], y - p[1]) > 26))
    + `<path class="ca-branch" d="${lines(branches)}"/><path class="ca-branch-node" d="${dots(branches.map(b => b[1]))}"/>`
    + trace(smooth(route)) + route.slice(0, -1).map(p => lit(p)).join('') + source(route[4])
    + label([44, 168], '0.0.0.0/0') + label([126, 96], 'sg-web') + label([214, 150], 'i-0a7f') + label([352, 78], 'role/admin')
    + status('path · 4 hops'));
};

// 02 Blast radius: rings of services around one failing dependency, fading with distance.
const blast = () => {
  const center = [200, 104], next = random(29);
  const at = (angle, radius) => [center[0] + Math.cos(angle) * radius * 1.5, center[1] + Math.sin(angle) * radius];
  const hops = [[], [], []], edges = [[], [], []];
  const first = [-2.5, -.65, .55, 2.55];
  first.forEach(angle => {
    const one = at(angle, 40);
    hops[0].push(one);
    edges[0].push([center, one]);
    [-.34, 0, .34].slice(next() > .5 ? 0 : 1).forEach(spread => {
      const a2 = angle + spread, two = at(a2, 74);
      hops[1].push(two);
      edges[1].push([one, two]);
      [-.13, .13].slice(next() > .35 ? 0 : 1).forEach(s => {
        const three = at(a2 + s, 106 + next() * 14);
        hops[2].push(three);
        edges[2].push([two, three]);
      });
    });
  });
  const total = hops.flat().length;
  const rings = [40, 74, 112].map(r => `<ellipse class="ca-ring" cx="${center[0]}" cy="${center[1]}" rx="${r * 1.5}" ry="${r}"/>`).join('');
  return svg(rings
    + `<path class="ca-hop3" d="${lines(edges[2])}"/><path class="ca-hop2" d="${lines(edges[1])}"/>`
    + trace(lines(edges[0]))
    + `<path class="ca-hop3-node" d="${dots(hops[2])}"/><path class="ca-hop2-node" d="${dots(hops[1])}"/>`
    + hops[0].map(p => lit(p, 2.8)).join('') + source(center)
    + label([center[0], center[1] + 27], 'orders-db') + label([hops[0][0][0] - 4, hops[0][0][1] - 10], 'checkout') + label([hops[0][1][0] + 6, hops[0][1][1] - 10], 'billing')
    + status(`blast radius · ${total} services`));
};

// 03 Two separate clusters that turn out to share a single link.
const connected = () => {
  const cluster = (cx, cy, seed) => {
    const next = random(seed), nodes = [];
    for (let i = 0; i < 17; i++) {
      // Golden-angle spacing keeps each cluster round and evenly filled.
      const angle = i * 2.39996 + next() * .5, radius = 22 + Math.sqrt(i / 16) * 44 + next() * 8;
      nodes.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * .82]);
    }
    const spokes = nodes.map(node => [[cx, cy], node]);
    return `<path class="ca-hop3" d="${lines(spokes)}"/><path class="ca-hop2" d="${lines(nearestEdges(nodes, 2))}"/><path class="ca-hop2-node" d="${dots(nodes)}"/>`;
  };
  const left = [82, 112], right = [318, 104], device = [200, 74];
  const route = [left, [142, 86], device, [258, 80], right];
  return svg(field(47, ([x, y]) => x > 150 && x < 250 && y > 110)
    + cluster(left[0], left[1], 5) + cluster(right[0], right[1], 83)
    + trace(smooth(route)) + lit(route[1], 2.4) + lit(route[3], 2.4) + lit(device, 3.6) + source(left) + source(right)
    + label([left[0], left[1] + 28], 'acct-17') + label([right[0], right[1] + 28], 'acct-92') + label([device[0], device[1] - 14], 'shared device')
    + status('2 accounts · 1 shared device'));
};

export const caseArt = [exposed(), blast(), connected()];

// The hero lights up the gold route painted into hero-traces (coordinates are image
// pixels, 1536 × 1024). hero-glow.webp is that route extracted from the illustration
// (artifacts/hero-glow.py), so it always registers. These strokes only reveal it, and
// are far wider than the line, so their exact position does not matter.
const heroRoute = [[372, 674], [402, 659], [470, 634], [527, 620], [565, 607], [587, 590], [577, 568], [603, 549], [649, 527], [708, 526], [760, 505], [801, 466], [862, 475], [927, 481], [1020, 440], [1094, 358], [1160, 364], [1222, 360], [1282, 320], [1343, 239]];
const heroNodes = [649, 801, 927, 1094, 1222, 1343].map(x => heroRoute.find(p => p[0] === x));
const heroDraw = 3.4, heroDelay = .5;
const heroLengths = heroRoute.reduce((all, p, i) => [...all, i ? all[i - 1] + Math.hypot(p[0] - heroRoute[i - 1][0], p[1] - heroRoute[i - 1][1]) : 0], []);
const heroWhen = point => round(heroDelay + heroDraw * heroLengths[heroRoute.indexOf(point)] / heroLengths.at(-1));

export const heroTrace = () => {
  const d = smooth(heroRoute, 5);
  const mask = (id, className) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><path class="${className}" pathLength="1" d="${d}"/></mask>`;
  const glow = (className, id) => `<image class="${className}" href="/assets/hero-glow.webp" width="1536" height="1024" mask="url(#${id})"/>`;
  return `<svg class="hero-trace" viewBox="0 0 1536 1024" aria-hidden="true"><defs>${mask('ht-reveal', 'ht-reveal')}${mask('ht-run', 'ht-run')}</defs><circle class="ht-moon" cx="1018" cy="138" r="70"/>${glow('ht-lit', 'ht-reveal')}${glow('ht-lit-run', 'ht-run')}${heroNodes.map(point => `<circle class="ht-flare" style="--at:${heroWhen(point)}s" cx="${point[0]}" cy="${point[1]}" r="30"/>`).join('')}</svg>`;
};

// Faint stars that carry the illustration's sky across to the left edge of the page.
export const heroSky = () => {
  const next = random(71), tiers = [[], [], []];
  for (let i = 0; i < 150; i++) tiers[next() < .62 ? 0 : next() < .75 ? 1 : 2].push([next() * 1000, next() * 700]);
  return `<svg class="hero-sky" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${tiers.map((nodes, i) => `<path class="hs-${i}" d="${dots(nodes)}"/>`).join('')}</svg>`;
};
