import { useEffect, useRef } from 'react';
import { onTick } from '../lib/ticker';
import { reduceMotion } from '../lib/motion';

/*
  The gold thread: one line that runs from the hero's scroll cue through every chapter and section to the closing
  invitation. It draws itself as you scroll, with a glowing head, and each section's dot lights up as it passes.
  On wide screens it runs down the gutter between the chapters' text and photos, then along the left margin.
*/
export default function Thread() {
  const svg = useRef(null), track = useRef(null), line = useRef(null), head = useRef(null), nodesG = useRef(null), grad = useRef(null);

  useEffect(() => {
    const main = svg.current.parentElement;
    let len = 0, lut = [], nodes = [], drawn = 0, mainTop = 0, built = false;

    const lenAtY = (y) => {
      let a = 0, b = lut.length - 1;
      if (!b) return 0;
      if (y <= lut[0][0]) return 0;
      if (y >= lut[b][0]) return len;
      while (b - a > 1) { const m = (a + b) >> 1; if (lut[m][0] < y) a = m; else b = m; }
      const A = lut[a], B = lut[b];
      return A[1] + (B[1] - A[1]) * ((y - A[0]) / Math.max(B[0] - A[0], 0.001));
    };

    // Position of an element inside <main>, ignoring transforms from reveal animations.
    const off = (el) => {
      let x = 0, y = 0, e = el;
      while (e && e !== main) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      return { x, y };
    };
    const rel = (el) => { const o = off(el), h = el.getBoundingClientRect().height; return { t: o.y, b: o.y + h, m: o.y + h / 2 }; };
    const seg = (A, B) => { const k = (B.y - A.y) * 0.42; return ` C ${A.x.toFixed(1)} ${(A.y + k).toFixed(1)}, ${B.x.toFixed(1)} ${(B.y - k).toFixed(1)}, ${B.x.toFixed(1)} ${B.y.toFixed(1)}`; };

    function build() {
      const hero = main.querySelector('.hero'), cue = main.querySelector('.cue'), end = document.querySelector('#end .eyebrow');
      if (!hero || !cue || !end) return;
      const H = main.offsetHeight, W = main.clientWidth;
      mainTop = main.getBoundingClientRect().top + scrollY;
      const wl = off(hero).x, cx = wl + hero.offsetWidth / 2;
      const wide = innerWidth >= 860, mx = wl >= 56 ? wl - 40 : wl - 8;
      const pts = [{ x: wide ? cx : mx, y: rel(cue).b + 6 }];
      for (const id of ['morning', 'afternoon', 'evening', 'night']) {
        const sec = document.getElementById(id), r = rel(sec);
        if (wide) pts.push({ x: cx, y: r.t + 30 }, { x: cx, y: r.m, node: true }, { x: cx, y: r.b - 30 });
        else pts.push({ x: mx, y: rel(sec.querySelector('.eyebrow')).m, node: true });
      }
      for (const id of ['amenities', 'gallery', 'booking', 'how', 'rules', 'place']) {
        pts.push({ x: mx, y: rel(document.getElementById(id).querySelector('.eyebrow')).m, node: true });
      }
      pts.push({ x: mx, y: rel(document.getElementById('place')).b + 10 });
      pts.push({ x: cx, y: rel(end).t - 34, node: true });

      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) d += seg(pts[i - 1], pts[i]);
      svg.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.current.style.height = H + 'px';
      track.current.setAttribute('d', d);
      line.current.setAttribute('d', d);
      grad.current.setAttribute('y2', H);
      len = line.current.getTotalLength();
      line.current.style.strokeDasharray = len;
      lut = [];
      const n = Math.max(60, Math.ceil(len / 10));
      for (let i = 0; i <= n; i++) { const L = (len * i) / n; lut.push([line.current.getPointAtLength(L).y, L]); }
      nodesG.current.textContent = '';
      nodes = pts.filter((p) => p.node).map((p) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', '3.5');
        c.setAttribute('class', 'thread-node');
        nodesG.current.appendChild(c);
        return { el: c, L: lenAtY(p.y), on: false };
      });
      built = true;
      update(true);
    }

    function update(snap) {
      if (!built) return;
      const goal = reduceMotion ? len : lenAtY(scrollY + innerHeight * 0.62 - mainTop);
      drawn = snap || reduceMotion ? goal : drawn + (goal - drawn) * 0.16;
      if (Math.abs(goal - drawn) < 0.5) drawn = goal;
      line.current.style.strokeDashoffset = (len - drawn).toFixed(1);
      const p = line.current.getPointAtLength(Math.max(drawn, 0));
      head.current.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      head.current.style.opacity = drawn > 2 && drawn < len - 1 ? 1 : 0;
      for (const nd of nodes) {
        const on = drawn >= nd.L - 1;
        if (on !== nd.on) { nd.on = on; nd.el.classList.toggle('on', on); }
      }
    }

    let timer = 0;
    const soon = () => { clearTimeout(timer); timer = setTimeout(build, 120); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(soon) : null;
    ro?.observe(main);
    addEventListener('v48:layout', soon);
    addEventListener('load', soon);
    build();
    const stop = onTick(() => update(false));
    return () => {
      stop(); ro?.disconnect(); clearTimeout(timer);
      removeEventListener('v48:layout', soon);
      removeEventListener('load', soon);
    };
  }, []);

  return (
    <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-0 w-full overflow-visible">
      <defs>
        <linearGradient ref={grad} id="thg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
          <stop offset="0" stopColor="#c9a868" />
          <stop offset=".45" stopColor="#e9d3a0" />
          <stop offset="1" stopColor="#f6e6bf" />
        </linearGradient>
        <radialGradient id="thh">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity=".95" />
          <stop offset=".35" stopColor="#dcc08a" stopOpacity=".45" />
          <stop offset="1" stopColor="#dcc08a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path ref={track} className="thread-track" />
      <path ref={line} className="thread-line" />
      <g ref={nodesG} />
      <g ref={head}>
        <circle r="18" fill="url(#thh)" />
        <circle r="3.4" fill="#fff3d6" />
      </g>
    </svg>
  );
}
