(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
const fmt = n => Math.round(n).toLocaleString('en-US');
const BLUE = '#2B80FF', SPARK = '#FF5A36', PAPER = '#F4EFE4';
const AVC = ['#2B80FF', '#FF5A36', '#1A3560', '#6AA6FF', '#E0472A', '#3E5C8A'];

function fitCanvas(cv) {
  const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
  cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d);
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return { c, w: r.width, h: r.height };
}
function onVisible(el, fn, opts) {
  const io = new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting, e)), opts || { threshold: 0.15 });
  io.observe(el); return io;
}
function countUp(el, to, dur = 1400, suffix = '') {
  if (RM) { el.textContent = fmt(to) + suffix; return; }
  const t0 = performance.now();
  const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e) + suffix; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
// rolling digits
function roll(el, str) {
  const chars = String(str).split('');
  if (el.dataset.len != chars.length) {
    el.innerHTML = ''; el.classList.add('roll');
    chars.forEach(ch => {
      if (/\d/.test(ch)) { const col = document.createElement('span'); col.className = 'col'; for (let i = 0; i < 10; i++) { const s = document.createElement('span'); s.textContent = i; col.appendChild(s); } el.appendChild(col); }
      else { const s = document.createElement('span'); s.className = 'sep'; s.textContent = ch; el.appendChild(s); }
    });
    el.dataset.len = chars.length;
    el.setAttribute('aria-label', str);
  }
  const kids = el.children;
  chars.forEach((ch, i) => { if (/\d/.test(ch) && kids[i].classList.contains('col')) kids[i].style.transform = `translateY(-${ch}em)`; else if (kids[i]) kids[i].textContent = ch; });
}

/* ---------- intro ---------- */
(() => {
  const intro = $('#intro'), cv = $('#introCv');
  const { c, w, h } = fitCanvas(cv);
  const pts = Array.from({ length: 260 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + .3, p: Math.random() * 6, col: Math.random() < .12 ? (Math.random() < .5 ? BLUE : SPARK) : PAPER }));
  let run = true;
  const draw = t => { if (!run) return; c.clearRect(0, 0, w, h); pts.forEach(p => { c.globalAlpha = .25 + .6 * Math.abs(Math.sin(t / 700 + p.p)); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }); requestAnimationFrame(draw); };
  requestAnimationFrame(draw);
  setTimeout(() => { intro.classList.add('gone'); setTimeout(() => { run = false; intro.remove(); }, 800); }, RM ? 200 : 1300);
})();

/* ---------- nav ---------- */
addEventListener('scroll', () => $('#nav').classList.toggle('solid', scrollY > 40), { passive: true });

/* ---------- hero: aerial plaza crowd ---------- */
(() => {
  const hero = $('#hero'), base = $('#heroBase'), color = $('#heroColor'), ring = $('#ring');
  const bc = base.getContext('2d'), cc = color.getContext('2d');
  let w, h, d, R, people = [], floor, visible = true;
  const CLOTH = ['#1F2A44', '#111418', '#3B3F46', '#C9B79C', '#B23A2E', '#2E5FA8', '#E2B33C', '#ECE8E0', '#4F6B4A', '#7A4E8C', '#D9673B', '#5C6E80'];
  const HAIR = ['#1B1410', '#2A1C14', '#0E0E0E', '#6B4B2E', '#C7A46B', '#8F8F8F'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  function buildFloor() {
    floor = document.createElement('canvas'); floor.width = w * d; floor.height = h * d;
    const f = floor.getContext('2d'); f.scale(d, d);
    f.fillStyle = '#A9A69E'; f.fillRect(0, 0, w, h);
    f.save(); f.translate(w / 2, h / 2); f.rotate(-0.52);
    const TW = 64, TH = 30, ext = Math.hypot(w, h);
    for (let y = -ext; y < ext; y += TH) {
      const off = (Math.round(y / TH) % 2) * TW / 2;
      for (let x = -ext; x < ext; x += TW) {
        const t = 150 + Math.random() * 30;
        f.fillStyle = `rgb(${t + 8},${t + 6},${t})`;
        f.fillRect(x + off + 1, y + 1, TW - 2, TH - 2);
      }
    }
    f.restore();
    // grime / texture
    for (let i = 0; i < w * h / 900; i++) { f.fillStyle = `rgba(60,55,50,${Math.random() * .08})`; f.fillRect(Math.random() * w, Math.random() * h, rnd(1, 4), rnd(1, 4)); }
  }
  function makePerson() {
    const ang = Math.random() < .5 ? rnd(-.4, .4) + (Math.random() < .5 ? 0 : Math.PI) : rnd(1.1, 2) + (Math.random() < .5 ? 0 : Math.PI);
    return { x: rnd(-20, w + 20), y: rnd(-20, h + 20), a: ang, s: rnd(.25, .6), ph: rnd(0, 6), cl: CLOTH[Math.floor(Math.random() * CLOTH.length)], hr: HAIR[Math.floor(Math.random() * HAIR.length)], sc: rnd(.9, 1.15) * (w < 700 ? 1.3 : 1.9), bag: Math.random() < .3, stand: Math.random() < .12 };
  }
  function init() {
    d = Math.min(devicePixelRatio || 1, 2);
    const r = hero.getBoundingClientRect(); w = r.width; h = r.height;
    [base, color].forEach(cv => { cv.width = w * d; cv.height = h * d; });
    bc.setTransform(d, 0, 0, d, 0, 0); cc.setTransform(1, 0, 0, 1, 0, 0);
    R = Math.max(130, Math.min(270, w * .26));
    ring.style.width = ring.style.height = R * 2 + 'px';
    color.style.setProperty('--r', R + 'px');
    buildFloor();
    const n = Math.round(w * h / (w < 700 ? 9000 : 15000));
    people = Array.from({ length: n }, makePerson);
  }
  function drawPerson(c, p, t) {
    const step = p.stand ? 0 : Math.sin(t / 160 * p.s * 2.4 + p.ph);
    c.save(); c.translate(p.x, p.y); c.scale(p.sc, p.sc);
    // shadow cast down-right
    c.save(); c.translate(7, 9); c.rotate(.6); c.fillStyle = 'rgba(20,18,16,.28)'; c.beginPath(); c.ellipse(0, 0, 13, 6, 0, 0, 7); c.fill(); c.restore();
    c.rotate(p.a);
    // legs
    c.fillStyle = '#23262C';
    c.beginPath(); c.ellipse(step * 5, -3, 4, 2.4, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(-step * 5, 3, 4, 2.4, 0, 0, 7); c.fill();
    // arms
    c.fillStyle = p.cl;
    c.beginPath(); c.ellipse(-step * 3.5, -8.5, 3.6, 2.2, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(step * 3.5, 8.5, 3.6, 2.2, 0, 0, 7); c.fill();
    if (p.bag) { c.fillStyle = '#2B2520'; c.fillRect(-7, -12, 6, 4); }
    // torso (shoulders)
    c.fillStyle = p.cl; c.beginPath(); c.ellipse(0, 0, 5.5, 9.5, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.stroke();
    // head
    c.fillStyle = '#C89F80'; c.beginPath(); c.arc(1.5, 0, 4.3, 0, 7); c.fill();
    c.fillStyle = p.hr; c.beginPath(); c.arc(0.6, 0, 4.1, Math.PI * .45, Math.PI * 1.55); c.fill();
    c.beginPath(); c.arc(0.2, 0, 3.6, 0, 7); c.fill();
    c.restore();
  }
  // ring follows pointer with easing, idles on the right
  let tx = 0, ty = 0, rx = 0, ry = 0, hovering = false;
  function idle(t) { tx = w * .82 + Math.sin(t / 2600) * w * .06; ty = h * .58 + Math.cos(t / 3100) * h * .08; }
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; hovering = true; });
  hero.addEventListener('pointerleave', () => hovering = false);
  const PINS = [['Reply posted · r/SaaS', 'r'], ['Profile visit from your ICP', ''], ['Founder post published', ''], ['Buyer asked a question', 'r'], ['DM from a buyer', ''], ['Thread saved', 'r'], ['Comment on ICP post', '']];
  let pi = 0;
  function pin(x, y) {
    let best = null, bd = 1e9;
    people.forEach(p => { const dd = (p.x - x) ** 2 + (p.y - y) ** 2; if (dd < bd) { bd = dd; best = p; } });
    const px = best && bd < 160 * 160 ? best.x : x, py = best && bd < 160 * 160 ? best.y : y;
    const [txt, k] = PINS[pi++ % PINS.length];
    const el = document.createElement('div'); el.className = 'pin';
    el.innerHTML = `<i class="${k}">${k ? '▲' : 'in'}</i>${txt}`;
    el.style.left = Math.min(Math.max(8, px + 14), w - 240) + 'px'; el.style.top = Math.max(84, py - 40) + 'px';
    hero.appendChild(el); setTimeout(() => el.remove(), 3300);
  }
  hero.addEventListener('click', e => {
    if (e.target.closest('a,button')) return;
    const r = hero.getBoundingClientRect(); pin(e.clientX - r.left, e.clientY - r.top);
  });
  if (!RM) setInterval(() => { if (!visible || document.hidden) return; pin(rx + rnd(-R * .6, R * .6), ry + rnd(-R * .6, R * .6)); }, 2600);
  init(); addEventListener('resize', init);
  onVisible(hero, v => visible = v, { threshold: 0 });
  const reachEl = $('#heroReach');
  roll(reachEl, '000,000,000');
  setTimeout(() => roll(reachEl, '130,300,000'), RM ? 0 : 1500);
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(50, t - last); last = t;
    if (visible) {
      if (!hovering) idle(t);
      rx += (tx - rx) * .09; ry += (ty - ry) * .09;
      ring.style.transform = `translate(${rx - R}px, ${ry - R}px)`;
      color.style.setProperty('--x', rx + 'px'); color.style.setProperty('--y', ry + 'px');
      bc.drawImage(floor, 0, 0, w, h);
      for (const p of people) {
        if (!RM && !p.stand) {
          p.x += Math.cos(p.a) * p.s * dt * .06; p.y += Math.sin(p.a) * p.s * dt * .06;
          if (Math.random() < .002) p.a += rnd(-.4, .4);
          if (p.x < -30) p.x = w + 30; if (p.x > w + 30) p.x = -30; if (p.y < -30) p.y = h + 30; if (p.y > h + 30) p.y = -30;
        }
        drawPerson(bc, p, t);
      }
      cc.clearRect(0, 0, color.width, color.height);
      cc.drawImage(base, 0, 0);
    }
    requestAnimationFrame(frame);
  }
  if (!RM) idle(0); rx = tx = w * .82; ry = ty = h * .58;
  requestAnimationFrame(frame);
})();

/* ---------- clients radar ---------- */
(() => {
  const svg = $('#radar'), NS = 'http://www.w3.org/2000/svg', C = 250;
  const mk = (t, a, p = svg) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const rings = [['Buying now', 70], ['Comparing', 130], ['Researching', 190], ['Listening', 245]];
  rings.forEach(([, r]) => mk('circle', { cx: C, cy: C, r, fill: 'none', stroke: 'rgba(11,29,58,.14)' }));
  for (let a = 0; a < 360; a += 30) { const rad = a * Math.PI / 180; mk('line', { x1: C, y1: C, x2: C + 245 * Math.cos(rad), y2: C + 245 * Math.sin(rad), stroke: 'rgba(11,29,58,.06)' }); }
  [0, 90, 180, 270].forEach(a => { const rad = (a - 90) * Math.PI / 180; const t = mk('text', { x: C + 262 * Math.cos(rad), y: C + 262 * Math.sin(rad) + 4, 'text-anchor': 'middle', class: 'blip-label', style: 'fill:#5A6580;font-size:10px' }); t.textContent = a + '°'; });
  rings.forEach(([n, r]) => { const t = mk('text', { x: C + 6, y: C - r + 14, class: 'blip-label', style: 'fill:#5A6580;font-size:9px;letter-spacing:.08em' }); t.textContent = n.toUpperCase(); });
  const defs = mk('defs', {});
  const lg = mk('linearGradient', { id: 'sw', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
  mk('stop', { offset: '0', 'stop-color': BLUE, 'stop-opacity': '0' }, lg); mk('stop', { offset: '1', 'stop-color': BLUE, 'stop-opacity': '.45' }, lg);
  const sweep = mk('g', {});
  mk('path', { d: `M${C},${C} L${C + 245},${C} A245,245 0 0,0 ${C + 245 * Math.cos(-0.55)},${C + 245 * Math.sin(-0.55)} Z`, fill: 'url(#sw)' }, sweep);
  mk('line', { x1: C, y1: C, x2: C + 245, y2: C, stroke: BLUE, 'stroke-width': 2 }, sweep);
  mk('circle', { cx: C, cy: C, r: 6, fill: '#0B1D3A' });
  const clients = [['r/SaaS', '“alternative to…”', 30, 110], ['r/startups', '“how did you find users?”', 75, 210], ['r/sales', '“which CRM?”', 120, 100], ['r/marketing', '“worth the price?”', 160, 225], ['r/Entrepreneur', '“is this legit?”', 205, 170], ['r/devops', '“tool recommendations”', 240, 60], ['r/sysadmin', '“anyone using…?”', 285, 200], ['r/ProductManagement', '“how do you track…”', 320, 150], ['r/smallbusiness', '“best software for…”', 345, 210], ['r/revops', '“X vs Y”', 190, 80]];
  const blips = clients.map(([name, res, ang, r]) => {
    const rad = (ang) * Math.PI / 180, x = C + r * Math.cos(rad), y = C + r * Math.sin(rad);
    const g = mk('g', {});
    const dot = mk('circle', { cx: x, cy: y, r: 5, fill: '#0B1D3A' }, g);
    const lab = mk('text', { x: x + 10, y: y + 4, class: 'blip-label' }, g); lab.textContent = name;
    const tg = mk('g', { class: 'blip-tag' }, g);
    const tw = res.length * 6.1 + 16;
    mk('rect', { x: x - tw / 2, y: y - 30, width: tw, height: 18, rx: 9 }, tg);
    const tt = mk('text', { x, y: y - 17.5, 'text-anchor': 'middle' }, tg); tt.textContent = res;
    return { ang, dot, tg, name, res };
  });
  let a = 0, last = performance.now(), vis = false;
  onVisible(svg, v => vis = v, { threshold: 0 });
  const ping = $('#ping');
  if (RM) { blips.forEach(b => b.tg.classList.add('on')); return; }
  function tick(t) {
    const dt = t - last; last = t;
    if (vis) {
      const prev = a; a = (a + dt * 0.04) % 360;
      sweep.setAttribute('transform', `rotate(${a} ${C} ${C})`);
      blips.forEach(b => {
        const crossed = prev <= a ? (b.ang > prev && b.ang <= a) : (b.ang > prev || b.ang <= a);
        if (crossed) {
          b.tg.classList.add('on'); b.dot.setAttribute('fill', BLUE); b.dot.setAttribute('r', 7);
          ping.textContent = `${b.name} · ${b.res}`;
          setTimeout(() => { b.tg.classList.remove('on'); b.dot.setAttribute('fill', '#0B1D3A'); b.dot.setAttribute('r', 5); }, 2600);
        }
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- crowd ---------- */
(() => {
  const box = $('#crowd'), cv = $('#crowdCv');
  let c, w, h, pts = [], buyer, vis = false, t0 = 0;
  function init() {
    ({ c, w, h } = fitCanvas(cv));
    pts = Array.from({ length: 600 }, () => ({ x: 20 + Math.random() * (w - 40), y: 50 + Math.random() * (h - 90), p: Math.random() * 6, r: Math.random() * 1.3 + .7 }));
    buyer = pts[Math.floor(Math.random() * 600)];
    buyer.x = w * .58; buyer.y = h * .42;
  }
  init(); addEventListener('resize', init);
  const oddsEl = $('#odds');
  onVisible(box, v => {
    vis = v;
    if (v && !box.dataset.done) {
      box.dataset.done = 1; t0 = performance.now();
      box.querySelectorAll('[data-count]').forEach(b => countUp(b, +b.dataset.count, 1800));
      if (!RM) { let n = 1; const it = setInterval(() => { n = Math.min(600, Math.round(n * 1.25 + 3)); oddsEl.textContent = n; if (n >= 600) clearInterval(it); }, 60); }
    }
  }, { threshold: 0.3 });
  function frame(t) {
    if (vis) {
      c.clearRect(0, 0, w, h);
      const prog = RM ? 1 : Math.min(1, (t - t0) / 2200);
      pts.forEach(p => {
        if (p === buyer) return;
        c.globalAlpha = (.25 + .45 * Math.abs(Math.sin(t / 900 + p.p))) * (1 - prog * .5);
        c.fillStyle = PAPER; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill();
      });
      c.globalAlpha = 1;
      const pr = 10 + 8 * Math.sin(t / 300);
      c.strokeStyle = 'rgba(43,128,255,.7)'; c.lineWidth = 2;
      c.beginPath(); c.arc(buyer.x, buyer.y, 18 + pr * prog, 0, 7); c.stroke();
      c.beginPath(); c.arc(buyer.x, buyer.y, 40 * prog, 0, 7); c.strokeStyle = 'rgba(43,128,255,.25)'; c.stroke();
      c.fillStyle = BLUE; c.beginPath(); c.arc(buyer.x, buyer.y, 7, 0, 7); c.fill();
      if (prog > .6) {
        c.globalAlpha = (prog - .6) / .4;
        c.fillStyle = PAPER; c.font = '600 13px "Bricolage Grotesque", sans-serif';
        c.fillText('u/ops_lead_jen', buyer.x + 18, buyer.y - 22);
        c.fillStyle = '#A3AFC6'; c.font = '11px "JetBrains Mono", monospace';
        c.fillText('“any good alternative to…?”', buyer.x + 18, buyer.y - 6);
        c.globalAlpha = 1;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- services ---------- */
(() => {
  const S = [
    { t: 'Reddit presence', d: 'Replies, threads and comments in the subreddits your ICP reads, written as the founder.', inc: ['ICP & subreddit map', 'Daily replies', 'Weekly threads', 'Reputation monitoring', 'Weekly report'], stat: 'Reddit threads rank on Google and in AI answers', price: 'Daily', per: '', vis: 'serp' },
    { t: 'LinkedIn content', d: 'Founder posts built from the real problems your buyers raise on Reddit.', inc: ['Positioning session', '3 posts a week', 'Hooks from Reddit research', 'Profile rewrite', 'Monthly report'], stat: 'Every post starts from a real buyer question', price: '3', per: ' posts a week', vis: 'li' },
    { t: 'LinkedIn engagement', d: 'Daily comments on your ICP\'s posts, so the right people know your name before you pitch.', inc: ['ICP target list', 'Daily comments', 'Connection strategy', 'DM handoff'], stat: 'Your name in front of buyers before you pitch', price: 'Daily', per: '', vis: 'cmt' },
    { t: 'ICP research', d: 'Who buys from you, what they complain about and exactly where they say it.', inc: ['ICP profile', 'Subreddit map', 'Pain-point library', 'Competitor mentions'], stat: 'Done once, updated monthly', price: 'Week 1', per: '', vis: 'icp' },
    { t: 'AMAs & launches', d: 'Planned AMAs and launch threads for a one-day spike on top of the daily drip.', inc: ['Subreddit pick', 'Mod outreach', 'Question prep', 'Live support', 'Recap post for LinkedIn'], stat: 'A one-day spike on top of the daily drip', price: 'As needed', per: '', vis: 'ama' },
    { t: 'Competitor intel', d: 'What users love and hate about the tools you compete with, pulled from Reddit every month.', inc: ['Mention tracking', 'Monthly insight report', 'Positioning gaps', 'Early-adopter list'], stat: 'Straight from what users say in public', price: 'Monthly', per: '', vis: 'intel' },
  ];
  const wrap = $('#svc');
  const visHTML = {
    serp: `<div class="serp-q"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>yourcompany reddit</div><span class="serp-meta">About 184,000 results · 0.38 s</span><div class="serp" data-serp></div><span class="serp-cap" data-cap>Position 5 · climbing</span>`,
    li: `<div class="li-post"><div class="li-head"><span class="av" style="background:${BLUE}">M</span><div><b>Maya R.</b><div style="font-size:11px;color:#5A6580">Founder · example post</div></div></div><p>87 people on r/SaaS said outbound is dead. I don't think it is. Here's what we changed when our reply rate hit 0.8%…</p><div class="react" data-react></div><div class="li-stats"><span><b data-imp>0</b> impressions</span><span><b data-cm>0</b> comments</span></div></div>`,
    cmt: `<span class="serp-meta">Your comments on ICP posts · today</span><div class="feed" data-feed></div>`,
    icp: `<div class="icp"><span class="mono">Role</span><span>Head of RevOps</span><span class="mono">Company</span><span>B2B SaaS, 50–300 people</span><span class="mono">Pain</span><span>“Our CRM data is a mess”</span></div><span class="serp-meta">Where they talk</span><div class="cloud" data-cloud>${['r/SaaS', 'r/sales', 'r/revops', 'r/startups', 'r/salesforce', 'r/hubspot', 'r/Entrepreneur', 'r/B2BMarketing', 'r/smallbusiness', 'r/marketing'].map(s => `<span>${s}</span>`).join('')}</div>`,
    ama: `<div class="ama-top"><span class="ama-live"><span class="livedot" style="background:#fff"></span>AMA live · r/SaaS</span><span class="serp-meta">Hour <b data-hr>1</b> of 24</span></div><div class="ama-n tnum" data-n>0</div><span class="serp-meta">comments</span><div class="bars" data-bars>${Array.from({ length: 24 }, () => '<i style="height:6%"></i>').join('')}</div>`,
    intel: `<span class="serp-meta">What r/SaaS says about [competitor]</span><div class="feed" data-intel></div>`,
  };
  [...wrap.children].forEach((el, i) => { el.querySelector('.svc-vis').innerHTML = visHTML[S[i].vis]; });
  const items = [...wrap.children];
  let cur = 0, hover = false, vis = false;
  function set(i) {
    cur = i; items.forEach((el, k) => el.classList.toggle('on', k === i));
    $('#svcIdx').textContent = `0${i + 1} / 06`; $('#svcName').textContent = S[i].t;
    startVis(items[i].querySelector('.svc-vis'));
  }
  items.forEach((el, i) => {
    el.addEventListener('click', () => { if (cur !== i) set(i); });
    el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && cur !== i) { e.preventDefault(); set(i); } });
  });
  wrap.addEventListener('pointerenter', () => hover = true);
  wrap.addEventListener('pointerleave', () => hover = false);
  onVisible(wrap, v => vis = v);
  if (!RM) setInterval(() => { if (!hover && vis && !document.hidden) set((cur + 1) % S.length); }, 7000);

  let timers = [];
  const clear = () => { timers.forEach(clearInterval); timers = []; };
  function startVis(v) {
    clear();
    const k = v.dataset.vis;
    if (k === 'serp') {
      const box = v.querySelector('[data-serp]'), cap = v.querySelector('[data-cap]');
      const rows = ['g2.com › categories', 'capterra.com › reviews', 'competitor.com › blog', 'trustradius.com', 'r/SaaS · “Is yourcompany legit?” answered by the founder'];
      box.innerHTML = rows.map((r, i) => `<div class="serp-row${i === 4 ? ' you' : ''}" style="top:${i * 52}px"><span class="fav"></span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r}</span><span class="pos">#${i + 1}</span></div>`).join('');
      const els = [...box.children]; let pos = 4;
      const order = [0, 1, 2, 3, 4];
      const place = () => order.forEach((ri, p) => { els[ri].style.top = p * 52 + 'px'; els[ri].querySelector('.pos').textContent = '#' + (p + 1); });
      timers.push(setInterval(() => {
        if (pos > 0) { const t = order[pos - 1]; order[pos - 1] = 4; order[pos] = t; pos--; place(); cap.textContent = pos === 0 ? 'Position 1 · your founder\'s thread' : `Position ${pos + 1} · climbing`; }
        else { order.splice(0, 5, 0, 1, 2, 3, 4); pos = 4; place(); cap.textContent = 'Position 5 · climbing'; }
      }, 1100));
    }
    if (k === 'li') {
      const imp = v.querySelector('[data-imp]'), cm = v.querySelector('[data-cm]'), rc = v.querySelector('[data-react]');
      let a = 0, b = 0; const reacts = ['Insightful', 'Agree', '+1 this', 'Saving this', 'Great point', 'So true'];
      rc.innerHTML = '';
      timers.push(setInterval(() => {
        a = a >= 41000 ? 0 : a + 700 + Math.random() * 900; b = Math.floor(a / 420);
        imp.textContent = fmt(a); cm.textContent = b;
        if (rc.children.length < 6 && Math.random() < .3) { const s = document.createElement('span'); s.textContent = reacts[rc.children.length]; rc.appendChild(s); }
        if (a === 0) rc.innerHTML = '';
      }, 120));
    }
    if (k === 'cmt' || k === 'intel') {
      const feed = v.querySelector(k === 'cmt' ? '[data-feed]' : '[data-intel]');
      const data = k === 'cmt'
        ? [['a VP of Sales', 'Agree on shorter sequences. We cut ours to 3 touches and replies doubled.'], ['a Head of RevOps', 'The CRM-hygiene point is underrated. Happy to compare notes.'], ['a SaaS founder', 'This matches what we see on r/sales every week.'], ['a CEO in your ICP', 'Saving this. The "problem first" opener works for us too.'], ['a RevOps lead', 'Great breakdown. What tool do you use for the sequencing?']]
        : [['neg', 'Pricing jumped 40% at renewal, looking for alternatives'], ['neg', 'Support takes 3 days to answer anything'], ['pos', 'Integrations are solid, onboarding was quick'], ['neg', 'Reporting is a mess once you pass 50 seats'], ['pos', 'Love the API, hate the UI']];
      feed.innerHTML = ''; let i = 0;
      const add = () => {
        const [a, b] = data[i++ % data.length];
        const el = document.createElement('div');
        if (k === 'cmt') { el.className = 'cmt'; el.innerHTML = `<span class="av" style="background:${AVC[i % 6]}">${a[0]}</span><div><b>You replied to ${a}</b>${b}</div>`; }
        else { el.className = 'quote-card'; el.style.animation = 'cmtIn .6s ease both'; el.innerHTML = `<span class="s ${a}">${a === 'neg' ? 'Complaint · opening for you' : 'Praise'}</span>“${b}”`; }
        feed.prepend(el); while (feed.children.length > 4) feed.lastChild.remove();
      };
      add(); add(); timers.push(setInterval(add, 1800));
    }
    if (k === 'icp') {
      const tags = [...v.querySelectorAll('[data-cloud] span')];
      timers.push(setInterval(() => { tags.forEach(t => t.classList.toggle('on', Math.random() < .3)); }, 1000));
    }
    if (k === 'ama') {
      const bars = [...v.querySelectorAll('[data-bars] i')], n = v.querySelector('[data-n]'), hr = v.querySelector('[data-hr]');
      let h = 0, total = 0; const shape = i => i < 2 ? 20 + i * 30 : i < 5 ? 95 - (i - 2) * 18 : Math.max(6, 40 * Math.exp(-(i - 5) / 4));
      bars.forEach(b => { b.style.height = '6%'; b.classList.remove('spike'); });
      timers.push(setInterval(() => {
        if (h >= 24) { h = 0; total = 0; bars.forEach(b => { b.style.height = '6%'; b.classList.remove('spike'); }); }
        const v2 = shape(h); bars[h].style.height = v2 + '%'; if (v2 > 60) bars[h].classList.add('spike');
        total += Math.round(v2 * 3.1); n.textContent = fmt(total); hr.textContent = h + 1; h++;
      }, 350));
    }
  }
  startVis(items[0].querySelector('.svc-vis'));
})();

/* ---------- case studies ---------- */
(() => {
  const cases = [
    { tab: 'Reddit daily users', mini: '110.4M → 130.3M', metric: 'Reddit daily active uniques', b: '110.4M', a: '130.3M', bl: 'Q2 2025', al: 'Q2 2026', src: 'Source · Reddit Q2 2026 results', url: 'https://www.sec.gov/Archives/edgar/data/0001713445/000171344526000098/earningspressreleaseq226.htm', head: 'Reddit added about 20 million daily users in a year', body: '130.3 million people a day, up 18% year over year. The audience your buyers are part of keeps growing.', tags: ['Reddit'] },
    { tab: 'AI answers', mini: '26.3% vs 40.1%', metric: 'Share of AI-search citations', b: '26.3%', a: '40.1%', bl: 'Wikipedia', al: 'Reddit', src: 'Source · Semrush, June 2025', url: 'https://www.semrush.com/blog/reddit-ai-search-visibility-study/', head: 'Reddit is cited in AI answers more than any other site', body: 'In a Semrush sample of 150,000 citations across ChatGPT, Perplexity and Google\'s AI features, 40.1% pointed to Reddit. What gets said about you there shapes what AI tells buyers.', tags: ['Reddit', 'AI search'] },
    { tab: 'LinkedIn members', mini: '1B → 1.2B', metric: 'LinkedIn members', b: '1B', a: '1.2B', bl: 'Nov 2023', al: 'Jul 2025', src: 'Source · LinkedIn, Microsoft FY25 Q4', url: 'https://news.linkedin.com/2025/Q4FY25_Earnings_Highlights', head: '200 million more members in under two years', body: 'LinkedIn reported 1.2 billion members and four straight years of double-digit member growth. It is still where B2B decision-makers read and hire.', tags: ['LinkedIn'] },
    { tab: 'Founder content', mini: '73% trust it more', metric: 'Decision-makers who trust thought leadership over marketing materials', b: '—', a: '73%', bl: 'Brochures & ads', al: 'Thought leadership', src: 'Source · Edelman × LinkedIn B2B Thought Leadership Report, 2024', url: 'https://www.edelman.com/insights/thought-leadership-gets-b2b-buyers-back-into-game', head: 'Buyers trust what founders write more than what marketing sends', body: '73% of B2B decision-makers say thought leadership is a more trustworthy basis for judging a company than its marketing materials.', tags: ['LinkedIn', 'Founder content'] },
  ];
  const tabs = $('#caseTabs');
  cases.forEach((c, i) => {
    const b = document.createElement('button'); b.className = 'case-tab' + (i ? '' : ' on'); b.setAttribute('role', 'tab');
    b.innerHTML = `<span class="av" style="background:${AVC[i]}">${c.tab[0]}</span><span><b>${c.tab}</b><small>${c.mini}</small></span>`;
    b.onclick = () => { [...tabs.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); show(i); };
    tabs.appendChild(b);
  });
  function show(i) {
    const c = cases[i];
    $('#cLabel').textContent = c.bl; $('#cLabel2').textContent = c.al;
    $('#cMetric1').textContent = $('#cMetric2').textContent = c.metric;
    $('#cBefore').textContent = c.b; $('#cAfter').textContent = c.a;
    $('#cType').textContent = c.src; $('#cHead').textContent = c.head; $('#cBody').textContent = c.body;
    $('#cTags').innerHTML = c.tags.map(t => `<span>${t}</span>`).join('');
    $('#cSrc').href = c.url;
    setPos(.5, true);
  }
  $('#cSrc').href = cases[0].url;
  const cmp = $('#compare'), after = $('#after'), handle = $('#handle');
  let drag = false;
  function setPos(p, anim) {
    p = Math.max(.04, Math.min(.96, p));
    after.style.transition = handle.style.transition = anim ? 'clip-path .6s ease, left .6s ease' : 'none';
    after.style.clipPath = `inset(0 0 0 ${p * 100}%)`; handle.style.left = p * 100 + '%';
  }
  const at = e => (e.clientX - cmp.getBoundingClientRect().left) / cmp.offsetWidth;
  cmp.addEventListener('pointerdown', e => { drag = true; cmp.setPointerCapture(e.pointerId); setPos(at(e)); });
  cmp.addEventListener('pointermove', e => { if (drag) setPos(at(e)); });
  cmp.addEventListener('pointerup', () => drag = false);
  handle.querySelector('button').addEventListener('keydown', e => {
    const cur = parseFloat(handle.style.left || 50) / 100;
    if (e.key === 'ArrowLeft') setPos(cur - .05); if (e.key === 'ArrowRight') setPos(cur + .05);
  });
  onVisible(cmp, v => { if (v && !cmp.dataset.done && !RM) { cmp.dataset.done = 1; setPos(.85, true); setTimeout(() => setPos(.3, true), 700); setTimeout(() => setPos(.5, true), 1400); } }, { threshold: .5 });
})();

/* ---------- how we work: sticky funnel ---------- */
(() => {
  const sec = $('#how'), steps = [...document.querySelectorAll('#steps .step')], layers = [...document.querySelectorAll('#funnel .layer')];
  const done = new Set();
  const small = () => innerWidth <= 860;
  function update() {
    let p;
    if (small()) { const r = sec.getBoundingClientRect(); p = Math.min(1, Math.max(0, (innerHeight * .8 - r.top) / r.height)) * 1.4; }
    else { const r = sec.getBoundingClientRect(); p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); }
    const k = Math.min(3, Math.floor(p * 4.2));
    steps.forEach((s, i) => s.classList.toggle('on', small() || i <= k));
    layers.forEach((l, i) => {
      const on = p > 0.02 && i <= k;
      l.classList.toggle('on', on);
      const v = l.querySelector('.v');
      if (on && !done.has(i)) { done.add(i); if (v.dataset.to) countUp(v, +v.dataset.to, 1200); }
    });
  }
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
})();

/* ---------- numbers dashboard ---------- */
(() => {
  const sets = {
    all: [['Reddit daily active uniques', '', '130.3', 'M', 'Reddit · Q2 2026'], ['Reddit weekly active uniques', '', '514.6', 'M', 'Reddit · Q2 2026'], ['Reddit share of AI-search citations', '', '40.1', '%', 'Semrush · Jun 2025'], ['LinkedIn members', '', '1.2', 'B', 'LinkedIn · Jul 2025']],
    rd: [['Daily active uniques', '', '130.3', 'M', 'Reddit · Q2 2026'], ['Daily users, year over year', '+', '18', '%', 'Reddit · Q2 2026'], ['International daily uniques', '', '77.1', 'M', 'Reddit · Q2 2026'], ['Reported value of Google\'s data deal, per year', '$', '60', 'M', 'Reuters · Feb 2024']],
    li: [['Members', '', '1.2', 'B', 'LinkedIn · Jul 2025'], ['Decision-makers who trust thought leadership over marketing materials', '', '73', '%', 'Edelman × LinkedIn · 2024'], ['Decision-makers more open to sales from consistent thought leaders', '', '9 in 10', '', 'Edelman × LinkedIn · 2024'], ['Researched a product they weren\'t considering after reading thought leadership', '', '75', '%+', 'Edelman × LinkedIn · 2024']],
  };
  const tiles = $('#tiles');
  function render(k, animate) {
    tiles.innerHTML = '';
    sets[k].forEach(([lbl, pre, v, suf, src], i) => {
      const t = document.createElement('div'); t.className = 'tile';
      t.innerHTML = `<span class="mono"><b>0${i + 1}</b>${lbl}</span><div class="big tnum">${pre}<span data-r></span>${suf}</div><span class="up" style="margin-top:auto">${src}</span>`;
      tiles.appendChild(t);
      const r = t.querySelector('[data-r]');
      if (animate && !RM) { roll(r, v.replace(/\d/g, '0')); requestAnimationFrame(() => requestAnimationFrame(() => roll(r, v))); } else roll(r, v);
    });
  }
  render('all', false);
  onVisible(tiles, v => { if (v && !tiles.dataset.done) { tiles.dataset.done = 1; render('all', true); } }, { threshold: .4 });
  document.querySelectorAll('#dashTabs button').forEach(b => b.onclick = () => { document.querySelectorAll('#dashTabs button').forEach(x => x.classList.toggle('on', x === b)); render(b.dataset.k, true); });
  const ev = ['130.3M people on Reddit every day', 'Reddit is the most-cited site in AI answers', 'Reddit threads rank on Google', '1.2B LinkedIn members', '73% of B2B buyers trust thought leadership over marketing', 'Buyers search “company + reddit” before they sign', 'Most AI-cited Reddit posts have under 20 upvotes', 'One AMA is a spike. The drip compounds.'];
  $('#marq').innerHTML = [...ev, ...ev].map(e => `<span>${e}</span>`).join('');
})();

/* ---------- content wall ---------- */
(() => {
  const subs = ['r/SaaS', 'r/startups', 'r/sales', 'r/devops', 'r/revops', 'r/Entrepreneur', 'r/marketing', 'r/humanresources'];
  const rt = ['Is outbound dead for B2B in 2026?', 'What CRM do you actually like?', 'Founders: how did you get your first 10 customers?', 'Anyone switched off [competitor]? Worth it?', 'How do you price a B2B tool under $100/mo?', 'Best way to find beta users without ads?', 'Our churn doubled after a price change. Advice?', 'Is [yourcompany] legit? Looking at buying'];
  const lt = ['I read 400 Reddit threads from our buyers. Here are the 5 complaints that came up most.', 'We stopped running ads for 90 days. Here\'s what happened to pipeline.', 'Your ICP is telling you what to build. You just have to read r/sales.', 'The one-line reply that got us 40 demos.', 'Why every SaaS founder should answer 3 Reddit threads a day.', 'What I learned from our first AMA (1,200 comments in 24 hours).'];
  const names = ['Maya R.', 'Dev K.', 'Sara L.', 'Tom A.', 'Nina P.', 'Leo M.'];
  let n = 0;
  function card() {
    n++;
    const k = n % 7;
    if (k === 3) { const f = [['Semrush', 'Most AI-cited Reddit posts have fewer than 20 upvotes.'], ['Edelman × LinkedIn', '9 in 10 decision-makers are more open to sales from consistent thought leaders.'], ['Reddit Q2 2026', '514.6M people use Reddit every week.']][n % 3]; return `<div class="wcard st"><span class="mono" style="font-size:10.5px">${f[0]}</span><span class="t" style="font-size:18px">${f[1]}</span></div>`; }
    if (k === 6) return `<div class="wcard sp"><span class="mono" style="font-size:10.5px">Why Reddit</span><span class="t" style="font-size:18px">${['Buyers search “company + reddit” before they sign.', 'Over half of AI-cited Reddit content comes from Q&A threads.', 'Reddit threads show up on Google for comparison searches.'][n % 3]}</span></div>`;
    if (k % 2) { const s = subs[n % subs.length]; return `<div class="wcard rd"><div class="h"><span class="av" style="background:${SPARK}">r/</span><b>${s}</b><span>· ${n % 12 + 1}h</span></div><div class="t">${rt[n % rt.length]}</div><div class="m"><span>Example thread</span><span>Founder reply</span></div></div>`; }
    const nm = names[n % names.length];
    return `<div class="wcard ln"><div class="h"><span class="av" style="background:${BLUE}">${nm[0]}</span><b>${nm}</b><span>· Founder</span></div><div>${lt[n % lt.length]}</div><div class="m"><span>Example post</span><span>Built from Reddit</span></div></div>`;
  }
  const wall = $('#wall');
  for (let col = 0; col < 5; col++) {
    const cards = Array.from({ length: 7 }, card).join('');
    wall.insertAdjacentHTML('beforeend', `<div class="wcol${col % 2 ? ' down' : ''}">${cards}${cards}</div>`);
  }
})();

/* ---------- reviews phone ---------- */
(() => {
  const R = [
    ['Reddit', 'r/SaaS', 'Reply posted', 'Your reply to “Best alternative to [competitor]?” is live.', 'now'],
    ['LinkedIn', 'Founder post', 'Published', 'This week\'s post, built from 3 r/sales threads, just went live.', '2m ago'],
    ['Reddit', 'r/startups', 'New question', 'Someone in your ICP asked how you handle onboarding. Reply drafted for review.', '9m ago'],
    ['LinkedIn', 'ICP comments', '12 today', 'Comments left on posts by heads of RevOps at target accounts.', '26m ago'],
    ['LinkedIn', 'Inbox', 'New DM', 'A buyer who read your Reddit reply sent you a message.', '1h ago'],
    ['The Drip Theory', 'Weekly report', 'Ready', 'Threads joined, posts published, profile visits and conversations this week.', '3h ago'],
  ];
  const box = $('#ntfs');
  R.forEach(([n, r, res, q, t], i) => box.insertAdjacentHTML('beforeend', `<div class="ntf"><div class="row"><span>${n.toUpperCase()}</span><span>${t}</span></div><div class="who"><span class="av" style="background:${n === 'Reddit' ? SPARK : BLUE}">${n === 'Reddit' ? 'r/' : n === 'LinkedIn' ? 'in' : 'D'}</span><div><b>${r}</b></div><span class="res">${res}</span></div><p>${q}</p></div>`));
  const ns = [...box.children];
  const d = new Date();
  $('#lockDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/(\w+), (\w+) (\d+)/, '$1, $3 $2');
  $('#lockTime').textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const sec = $('#revBox');
  const small = () => innerWidth <= 860;
  function update() {
    if (small()) { ns.forEach((n, i) => n.classList.toggle('on', i < 4)); return; }
    const r = sec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    const k = Math.round(p * 4) + 1;
    // newest on top: show the last k, max 4 visible
    ns.forEach((n, i) => n.classList.toggle('on', i < k && i >= k - 4));
  }
  if (RM) ns.forEach((n, i) => n.classList.toggle('on', i < 4));
  else { addEventListener('scroll', update, { passive: true }); update(); }
})();

/* ---------- faq ---------- */
(() => {
  const box = $('#faqList');
  box.querySelectorAll('.qa').forEach(el => el.querySelector('button').onclick = () => {
    const open = !el.classList.contains('open');
    box.querySelectorAll('.qa').forEach(x => { x.classList.remove('open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
    if (open) { el.classList.add('open'); el.querySelector('button').setAttribute('aria-expanded', 'true'); }
  });
})();

/* ---------- insight art ---------- */
(() => {
  const draw = (id, kind) => {
    const cv = $('#' + id); if (!cv) return;
    const { c, w, h } = fitCanvas(cv);
    c.fillStyle = kind === 1 ? '#FF5A36' : kind === 2 ? '#2B80FF' : '#0B1D3A'; c.fillRect(0, 0, w, h);
    if (kind === 0) {
      for (let i = 0; i < 400; i++) { c.fillStyle = Math.random() < .08 ? BLUE : 'rgba(244,239,228,.4)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6 + .5, 0, 7); c.fill(); }
      c.fillStyle = PAPER; c.beginPath(); c.roundRect(w * .1, h * .38, w * .8, 54, 27); c.fill();
      c.fillStyle = '#0B1D3A'; c.font = `500 ${Math.max(14, w / 32)}px "Bricolage Grotesque", sans-serif`; c.fillText('yourcompany + scam', w * .1 + 26, h * .38 + 34);
      c.fillStyle = BLUE; c.fillRect(w * .1 + 26 + c.measureText('yourcompany + scam').width + 4, h * .38 + 16, 2, 24);
    } else if (kind === 1) {
      c.fillStyle = 'rgba(255,255,255,.9)'; c.font = `800 ${w * .42}px "Bricolage Grotesque", sans-serif`; c.textAlign = 'center'; c.fillText('AI', w / 2, h * .66);
    } else {
      for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(255,255,255,${.15 + i * .12})`; c.beginPath(); c.roundRect(w * .14, h * .14 + i * h * .12, w * (.3 + (i % 3) * .2), h * .08, 6); c.fill(); }
    }
  };
  const run = () => { draw('art0', 0); draw('art1', 1); draw('art2', 2); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
  addEventListener('resize', run);
})();

/* ---------- audit form + clock ---------- */
(() => {
  const clock = $('#clock');
  const tick = () => clock.textContent = new Date().toLocaleTimeString('en-GB');
  tick(); setInterval(tick, 1000);
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const em = $('#em'), note = $('#formNote');
    if (!/^\S+@\S+\.\S+$/.test(em.value)) { note.className = 'form-note mono'; note.textContent = 'Enter a work email so we know where to send your audit.'; em.focus(); return; }
    const stage = $('#stage').value === 'Company stage' ? '' : $('#stage').value;
    const body = encodeURIComponent(`Work email: ${em.value}\nCompany stage: ${stage}\n\nI'd like a free Reddit × LinkedIn audit.`);
    note.className = 'form-ok'; note.textContent = 'Opening your email app. If nothing opens, write to hello@thedriptheory.com.';
    window.location.href = `mailto:hello@thedriptheory.com?subject=${encodeURIComponent('Free audit request')}&body=${body}`;
  });
})();
})();
