import React, { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
const CENTER = 14;
const RADIUS = 12.1;
const AMPLITUDE = 1.15;

function arcPath(start, sweep, phase, wavy) {
  const steps = Math.max(2, Math.ceil(sweep / (Math.PI / 90)));
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const along = sweep * i / steps;
    const angle = start + along;
    const edge = Math.min(1, along / .28, (sweep - along) / .28);
    const envelope = Math.sin(Math.max(0, edge) * Math.PI / 2);
    const radius = RADIUS + (wavy ? AMPLITUDE * envelope * Math.sin(8 * angle + phase) : 0);
    const x = CENTER + radius * Math.cos(angle);
    const y = CENTER + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`);
  }
  return points.join(' ');
}

function pathsAt(ms) {
  const cycle = (ms % 3000) / 3000;
  const growth = cycle < .5 ? cycle * 2 : (1 - cycle) * 2;
  const sweep = (15 + 255 * growth) * Math.PI / 180;
  const tail = cycle > .5 ? (cycle - .5) * 2 * 255 * Math.PI / 180 : 0;
  const start = ms / 2000 * TAU + tail - Math.PI / 2;
  const phase = -ms / 1000 * TAU;
  const gap = .12;
  return {
    active: arcPath(start, sweep, phase, true),
    trail: arcPath(start + sweep + gap, TAU - sweep - gap * 2, phase, false),
  };
}

export default function LoadingSpinner() {
  const activeRef = useRef(null);
  const trailRef = useRef(null);
  const initial = pathsAt(0);
  useEffect(() => {
    let frame;
    let started;
    const draw = (now) => {
      started ??= now;
      const paths = pathsAt(now - started);
      activeRef.current?.setAttribute('d', paths.active);
      trailRef.current?.setAttribute('d', paths.trail);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <svg className="loading-spinner" viewBox="0 0 28 28" aria-hidden="true">
      <path ref={trailRef} className="loading-trail" d={initial.trail} />
      <path ref={activeRef} className="loading-arc" d={initial.active} />
    </svg>
  );
}
