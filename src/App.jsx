import React, { useEffect, useRef, useState } from 'react';
import SettingsModal from './SettingsModal.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { acquireMediaInputs } from './mediaInputs.js';
import WelcomeWebsitePage from './WelcomeWebsitePage';
import { intlTag, translate } from './locale.js';
import { pickPageBooking } from './bookingDisplay.js';

import './SettingsModal.css';

/** Temporary: open straight on the last verification dialog. Turn off when asked to Recover. */
const SHOW_LAST_VERIFY_ONLY = false;

/** Temporary: laptop join skips verification, as if it is already done. Restore when asked "kk". */
const SKIP_HUMAN_VERIFY = false;

/* ---------- Icons (inline SVG) ---------- */
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.92" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2.4" width="6" height="11" rx="3" />
    <path d="M6.2 11a5.8 5.8 0 0 0 11.6 0" />
    <path d="M12 16.8V19.5" />
    <path d="M8.6 19.7h6.8" />
  </svg>
);
const MicOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.92" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2.4" width="6" height="11" rx="3" />
    <path d="M6.2 11a5.8 5.8 0 0 0 11.6 0" />
    <path d="M12 16.8V19.5" />
    <path d="M8.6 19.7h6.8" />
    <path d="M5 5l14 14" />
  </svg>
);
const CtrlMicIcon = () => (
  <img className="ctrl-mic" src="/mic-glyph.png" alt="" />
);
const CtrlMicOffIcon = () => (
  <img className="ctrl-mic-off" src="/mic-off.png" alt="" />
);
const CamIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3.2" y="5.5" width="13.1" height="12.8" rx="1.5" />
    <path d="M16.3 10.6 20.8 6.1v11.7L16.3 13.3Z" fill="currentColor" stroke="none" />
  </svg>
);
const CamOffIcon = () => (
  <img className="cam-off-icon" src="/cam-off.png" alt="" />
);
const SpeakerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
    <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
  </svg>
);
const ChipMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.04" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2.5" width="6" height="11" rx="3" />
    <path d="M6.5 11a5.5 5.5 0 0 0 11 0" />
    <path d="M12 16.5V19.2" />
    <path d="M9 19.5h6" />
  </svg>
);
const ChipSpeaker = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.16" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
/* Same camera glyph as the big round control (CamIcon), sized for the device chip */
const ChipCam = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3.2" y="5.5" width="13.1" height="12.8" rx="1.5" />
    <path d="M16.3 10.6 20.8 6.1v11.7L16.3 13.3Z" fill="currentColor" stroke="none" />
  </svg>
);
const RecordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
    <rect x="6.2" y="4.2" width="11.6" height="15.6" rx="1.6" />
    <path d="M9.2 4.2h5.6V6.6H9.2z" />
    <path d="m9.1 13.1 1.9 1.9 3.9-4.1" />
  </svg>
);
const Caret = () => (
  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 3l4 4 4-4z" fill="currentColor" /></svg>
);
const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);
const PermBtnMic = () => (
  <img className="perm-btn-icon mic" src="/perm-mic.png" alt="" />
);
const PermBtnCam = () => (
  <img className="perm-btn-icon cam" src="/perm-cam.png" alt="" />
);
const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
);
/* Calendar + clock, matching Meet’s “Scheduled for” glyph */
/* Schedule — calendar + clock (Meet / Material calendar_clock) */
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm378.5-18.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM787-145l28-28-75-75v-112h-40v128l87 87Z" />
  </svg>
);
/* Companion mode — Material Symbols `meeting_room` (open door) */
const CompanionIcon = () => (
  <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M120-120v-80h80v-640h400v40h160v600h80v80H680v-600h-80v600H120Zm160-640v560-560Zm188.5 308.5Q480-463 480-480t-11.5-28.5Q457-520 440-520t-28.5 11.5Q400-497 400-480t11.5 28.5Q423-440 440-440t28.5-11.5ZM280-200h240v-560H280v560Z" />
  </svg>
);
/* Present — rounded screen + up arrow (Meet / Material present_to_all) */
const PresentIcon = () => (
  <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M440-320h80v-166l64 63 57-57-161-160-160 160 57 56 63-63v167ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z" />
  </svg>
);
const Warn = ({ size = 18, pill = false }) => (
  <span
    className={`warn${pill ? ' pill' : ''}`}
    style={pill
      ? { width: Math.round(size * 0.72), height: size, fontSize: size * 0.62 * 1.2 }
      : { width: size, height: size, fontSize: size * 0.7 }}
  >
    !
  </span>
);
const Dots = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);
/* Material Symbols Outlined — match Meet “more options” row (no PNG ring) */
/* Exact Meet sample glyph (person-in-frame + spark) — ring cropped via CSS mask */
const MenuEffectsIcon = () => (
  <>
    <svg className="menu-effects-filter" aria-hidden="true">
      <filter id="menu-effects-thin" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology operator="erode" radius="0.87" />
      </filter>
    </svg>
    <span className="menu-effects-ico" aria-hidden="true" />
  </>
);
const FlagIcon = () => (
  <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    {/* Material feedback */}
    <path d="M480-360q17 0 28.5-11.5T520-400q0-17-11.5-28.5T480-440q-17 0-28.5 11.5T440-400q0 17 11.5 28.5T480-360Zm-40-160h80v-240h-80v240ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
  </svg>
);
/* White glyphs for blue circular list icons (Meet sample) */
const FeedbackFlagIcon = () => (
  <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M480-360q17 0 28.5-11.5T520-400q0-17-11.5-28.5T480-440q-17 0-28.5 11.5T440-400q0 17 11.5 28.5T480-360Zm-40-160h80v-240h-80v240ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
  </svg>
);
const FeedbackIdeaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
  </svg>
);
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    {/* Material troubleshoot */}
    <path d="M824-120 636-308q-41 32-90.5 50T440-240q-90 0-162.5-44T163-400h98q34 37 79.5 58.5T440-320q100 0 170-70t70-170q0-100-70-170t-170-70q-94 0-162.5 63.5T201-580h-80q8-127 99.5-213.5T440-880q134 0 227 93t93 227q0 56-18 105.5T692-364l188 188-56 56ZM397-400l-63-208-52 148H80v-60h160l66-190h60l61 204 43-134h60l60 120h30v60h-67l-47-94-50 154h-59Z" />
  </svg>
);
const GearIcon = () => (
  <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    {/* Material settings */}
    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
  </svg>
);
/* Exact Meet sample glyph (person-in-frame + sparkle), including ring */
const EffectsIcon = () => (
  <img className="effects-glyph" src="/effects-icon.png" alt="" width="56" height="56" draggable="false" />
);

function cleanDeviceLabel(label) {
  return label
    .replace(/^(Default|Communications)\s*-\s*/i, '')
    .replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, '')
    .trim();
}

/* Meet-style CPU USAGE chart — new sample every 1s, smooth native look */
const CPU_SAMPLES = 60;
function seedCpuSeries() {
  const arr = [];
  let v = 26 + Math.random() * 10;
  for (let i = 0; i < CPU_SAMPLES; i += 1) {
    v = Math.min(88, Math.max(6, v + (Math.random() - 0.48) * 10));
    arr.push(Math.round(v * 10) / 10);
  }
  return arr;
}
function formatChartTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
function CpuUsageChart({ active }) {
  const [points, setPoints] = useState(seedCpuSeries);
  const [tickAt, setTickAt] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1] ?? 30;
        const next = Math.min(96, Math.max(4, last + (Math.random() - 0.48) * 12));
        return [...prev.slice(1), Math.round(next * 10) / 10];
      });
      setTickAt(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const W = 360;
  const H = 168;
  const padL = 8;
  const padR = 40;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = Math.max(points.length - 1, 1);
  const xy = points.map((p, i) => {
    const x = padL + (i / n) * plotW;
    const y = padT + (1 - p / 100) * plotH;
    return [x, y];
  });
  // Smooth cubic path (Meet-like continuous line)
  let lineD = '';
  xy.forEach(([x, y], i) => {
    if (i === 0) { lineD = `M ${x} ${y}`; return; }
    const [x0, y0] = xy[i - 1];
    const cx = (x0 + x) / 2;
    lineD += ` C ${cx} ${y0}, ${cx} ${y}, ${x} ${y}`;
  });
  const first = xy[0];
  const last = xy[xy.length - 1];
  const areaD = `${lineD} L ${last[0]} ${padT + plotH} L ${first[0]} ${padT + plotH} Z`;
  const yTicks = [0, 25, 50, 75, 100];
  const timeLabels = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const ageSec = Math.round((1 - t) * (CPU_SAMPLES - 1));
    return { t, label: formatChartTime(tickAt - ageSec * 1000) };
  });
  const latest = points[points.length - 1] ?? 0;

  return (
    <div className="ts-chart-wrap">
      <svg className="ts-chart" viewBox={`0 0 ${W} ${H}`} width="100%" height="168" role="img" aria-label={`CPU usage ${Math.round(latest)} percent`}>
        <defs>
          <linearGradient id="tsCpuFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((v) => {
          const y = padT + (1 - v / 100) * plotH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} className="ts-grid" />
              <text x={W - 6} y={y + 4} textAnchor="end" className="ts-y-label">{v}%</text>
            </g>
          );
        })}
        <path d={areaD} fill="url(#tsCpuFill)" />
        <path d={lineD} fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="3.5" fill="#1a73e8" />
        {timeLabels.map(({ t, label }) => (
          <text
            key={t}
            x={padL + t * plotW}
            y={H - 6}
            textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}
            className="ts-x-label"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* Group the OS "Default" entry with the real device it points at, and drop the
   duplicate "Communications" entry, matching the Meet device menu. */
function prepareDevices(list, kind, fallback) {
  const raw = list.filter((d) => d.kind === kind).map((d, i) => ({
    // Browsers deliberately redact IDs before permission. Keep them blank so we
    // request the browser default instead of sending a fabricated exact ID.
    id: d.deviceId || '',
    raw: d.label || `${fallback} ${i + 1}`,
  }));
  const isDefault = (d) => d.id === 'default' || /^Default\s*-/i.test(d.raw);
  const isComm = (d) => d.id === 'communications' || /^Communications\s*-/i.test(d.raw);
  const def = raw.find(isDefault);
  const defName = def ? cleanDeviceLabel(def.raw) : '';
  const physical = raw.filter((d) => !isDefault(d) && !isComm(d));
  const options = [];
  if (def) {
    const match = physical.find((d) => cleanDeviceLabel(d.raw) === defName);
    options.push({ id: match?.id || def.id, label: defName || fallback, systemDefault: true });
  }
  physical.forEach((d) => {
    const name = cleanDeviceLabel(d.raw);
    if (def && name === defName) return;
    options.push({ id: d.id, label: name || fallback, systemDefault: false });
  });
  return options.length ? options : raw.map((d) => ({ id: d.id, label: cleanDeviceLabel(d.raw) || fallback, systemDefault: false }));
}

/* Live mic level while the device menu is open (Meet-style) */
function MicMeter({ active, stream }) {
  const barRef = useRef(null);
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    bar.style.transform = 'scaleX(0.04)';
    if (!active) return undefined;
    let stop = false;
    let ctx = null;
    let raf = 0;
    let smooth = 0;
    let floor = 0;
    (async () => {
      try {
        if (!stream?.getAudioTracks().length) return;
        ctx = new AudioContext();
        await ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const freq = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (stop) return;
          analyser.getByteFrequencyData(freq);
          let sum = 0;
          for (let i = 1; i < 24; i += 1) sum += freq[i];
          const raw = sum / 23;
          floor = floor === 0 ? raw : raw < floor ? raw : floor + (raw - floor) * 0.02;
          const target = Math.min(1, Math.max(0.04, (raw - floor - 8) / 70));
          smooth += (target - smooth) * 0.35;
          bar.style.transform = `scaleX(${smooth.toFixed(3)})`;
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        bar.style.transform = 'scaleX(0.04)';
      }
    })();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      ctx?.close();
    };
  }, [active, stream]);
  return (
    <div className="meter" aria-hidden="true">
      <span className="meter-icon"><MicIcon /></span>
      <span className="meter-track">
        <span className="meter-bar" ref={barRef} />
      </span>
    </div>
  );
}

function ListeningDots({ active, stream }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    const dots = wrapRef.current ? [...wrapRef.current.children] : [];
    dots.forEach((dot) => { dot.style.transform = 'scaleY(1)'; });
    if (!active) return undefined;
    let stop = false;
    let ctx = null;
    let raf = 0;
    const smooth = [0, 0, 0];
    const floor = [0, 0, 0];
    (async () => {
      try {
        if (!stream?.getAudioTracks().length) return;
        ctx = new AudioContext();
        await ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.55;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const freq = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (stop) return;
          analyser.getByteFrequencyData(freq);
          [1, 4, 9].forEach((bin, i) => {
            const raw = freq[bin];
            floor[i] = floor[i] === 0 ? raw : raw < floor[i] ? raw : floor[i] + (raw - floor[i]) * 0.02;
            const target = Math.min(1, Math.max(0, (raw - floor[i] - 12) / 60));
            smooth[i] += (target - smooth[i]) * 0.45;
            const el = dots[i];
            if (el) el.style.transform = `scaleY(${(1 + smooth[i] * 2).toFixed(2)})`;
          });
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        /* leave the dots still if the microphone cannot be opened */
      }
    })();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      ctx?.close();
    };
  }, [active, stream]);
  return (
    <span className="more-dots" ref={wrapRef} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

/* ---------- Device dropdown ---------- */
function playSpeakerTest(deviceId) {
  const ctx = new AudioContext();
  (async () => {
    if (deviceId && ctx.setSinkId) {
      try { await ctx.setSinkId(deviceId); } catch { /* play on the default output */ }
    }
    const now = ctx.currentTime;
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
    setTimeout(() => ctx.close(), 800);
  })();
}

function EffectsChip({ enabled, label, menuLabel, onChoose }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);
  useEffect(() => {
    const close = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (open) setShown(true);
  }, [open]);
  return (
    <div className="device" ref={ref}>
      <button type="button" className="device-btn" title={label} disabled={!enabled} aria-expanded={open} aria-haspopup="menu" onClick={() => enabled && setOpen(!open)}>
        <span className="device-icon"><MenuEffectsIcon /></span>
        <span className="device-label">{label}</span>
        <span className={`caret ${open ? 'up' : ''}`}><Caret /></span>
      </button>
      {shown && (
        <div className={`menu device-menu ${open ? 'in' : 'out'}`} role="menu" onAnimationEnd={() => { if (!open) setShown(false); }}>
          <button type="button" className="menu-action" role="menuitem" onClick={() => { setOpen(false); onChoose(); }}>{menuLabel}</button>
        </div>
      )}
    </div>
  );
}

function DeviceSelect({ icon, label, options, value, onChange, meter, meterStream, testSpeakers, cameraMissing, onCameraInfo, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (open) setShown(true);
  }, [open]);
  return (
    <div className="device" ref={ref}>
      <button className="device-btn" title={label} disabled={disabled} onClick={() => (options.length || cameraMissing) && setOpen(!open)} aria-expanded={open}>
        <span className="device-icon">{icon}</span>
        <span className="device-label">{label}</span>
        <span className={`caret ${open ? 'up' : ''}`}><Caret /></span>
      </button>
      {shown && (
        <div className={`menu device-menu ${open ? 'in' : 'out'}`}
             onAnimationEnd={() => { if (!open) setShown(false); }}>
          {options.length > 0 && (
          <ul>
            {options.map((o) => (
              <li key={o.id} className={`${o.id === value ? 'active' : ''} ${o.systemDefault ? 'system' : ''}`.trim()}
                  onClick={() => { onChange(o.id); setOpen(false); }}>
                <span className="tick">{o.id === value && <Check />}</span>
                <span className="opt-text">
                  <span className="opt-name">{o.label}</span>
                  {o.systemDefault && <span className="opt-sub">System default</span>}
                </span>
              </li>
            ))}
          </ul>
          )}
          {meter && (
            <>
              <div className="menu-rule" />
              <MicMeter active={open} stream={meterStream} />
            </>
          )}
          {testSpeakers && (
            <div className="speaker-test">
              <button type="button" onClick={() => playSpeakerTest(value)}>
                <span className="test-icon"><ChipSpeaker /></span>
                <span>Test speakers</span>
              </button>
            </div>
          )}
          {cameraMissing && (
            <>
              <button type="button" className="menu-action">
                <span className="test-icon"><RecordIcon /></span>
                <span>Make a test recording</span>
              </button>
              <div className="menu-rule" />
              <button type="button" className="menu-action tall" onClick={() => { setOpen(false); onCameraInfo?.(); }}>
                <span className="test-icon"><Warn size={18} /></span>
                <span className="opt-text">
                  <span className="opt-name">Camera not found</span>
                  <span className="opt-sub">Show more info</span>
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const JOIN_NOW_BEFORE_MS = 30 * 60 * 1000;
const PERSONAL_HOLD_MS = 7 * 60 * 1000;
const WAITING_LEAD_MS = 15 * 1000;
const LOCK_WINDOW_MS = 10 * 60 * 1000;

function formatFullDate(startMs, locale) {
  return new Intl.DateTimeFormat(intlTag(locale), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startMs));
}

function sameCalendarDay(leftMs, rightMs) {
  const left = new Date(leftMs);
  const right = new Date(rightMs);
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function systemKind() {
  const platform = `${navigator.userAgentData?.platform || ''} ${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'max';
  return 'linux';
}

function robotCheckText() {
  const kind = systemKind();
  if (kind === 'windows') return 'verifywindows';
  if (kind === 'max') return 'verifymax';
  return 'verifylinux';
}

function SystemKeySign() {
  const kind = systemKind();
  if (kind === 'windows') {
    return (
      <img className="rc-key" src="/windows-key.png" alt="Windows" draggable="false" />
    );
  }
  if (kind === 'max') return <span className="rc-key-char" aria-label="Mac">⌘</span>;
  return 'linux';
}

const VERIFIED_COOKIE = 'verified=true';

function readVerifiedCookie() {
  return document.cookie.split('; ').includes(VERIFIED_COOKIE);
}

function writeVerifiedCookie() {
  document.cookie = `${VERIFIED_COOKIE}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

const JOIN_COOKIE = 'join=true';

function readJoinCookie() {
  return document.cookie.split('; ').includes(JOIN_COOKIE);
}

function writeJoinCookie() {
  document.cookie = `${JOIN_COOKIE}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function clearBookingCookies() {
  document.cookie = 'meet_guest=; Path=/; Max-Age=0';
  document.cookie = 'meet_start=; Path=/; Max-Age=0';
}

function readLock() {
  const row = document.cookie.split('; ').find((part) => part.startsWith('meet_lock='));
  if (!row) return null;
  try {
    const data = JSON.parse(decodeURIComponent(row.slice('meet_lock='.length)));
    const start = Number(data?.start);
    if (!data?.name || !Number.isFinite(start)) return null;
    return { id: String(data.id || ''), name: String(data.name), email: String(data.email || ''), start };
  } catch {
    return null;
  }
}

function writeLock(guest) {
  const start = Number.isFinite(guest?.start) ? guest.start : Date.parse(guest?.startTime);
  if (!guest?.name || !Number.isFinite(start)) return null;
  const saved = { id: String(guest.id || ''), name: guest.name, email: guest.email || '', start };
  document.cookie = `meet_lock=${encodeURIComponent(JSON.stringify(saved))}; Path=/; Max-Age=315360000; SameSite=Lax`;
  return saved;
}

function detectHandheld() {
  const ua = `${navigator.userAgentData?.platform || ''} ${navigator.userAgent || ''}`;
  if (/iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return true;
  return window.matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
}

function isPhoneJoinBlock() {
  if (detectHandheld()) return true;
  return window.innerWidth < 768;
}

const NTFY_SIGNAL = 'https://ntfy.sh/stas-signal-8x7k2q/json?poll=1';

async function ntfySignalIsOne(since) {
  const res = await fetch(`${NTFY_SIGNAL}&since=${since}`, { cache: 'no-store' });
  if (!res.ok) return false;
  const messages = (await res.text()).split('\n').flatMap((line) => {
    if (!line.trim()) return [];
    try {
      const data = JSON.parse(line);
      return data.message == null ? [] : [String(data.message).trim()];
    } catch {
      return [];
    }
  });
  return messages.at(-1) === '1';
}

function copyRobotCheck() {
  const text = robotCheckText();
  copyRobotCheckFallback(text);
  navigator.clipboard?.writeText?.(text).catch(() => {});
}

function copyRobotCheckFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function minutesUntilStart(startMs, now) {
  if (!Number.isFinite(startMs)) return null;
  const remaining = startMs - now;
  if (!sameCalendarDay(startMs, now) || remaining <= 0 || remaining >= 60 * 60 * 1000) return null;
  const minutes = Math.ceil(remaining / 60000);
  return minutes < 60 ? minutes : null;
}

/** Full date until the meeting day. On that day, the booked clock time. Under one hour, remaining minutes only. */
function formatScheduled(startMs, now, locale) {
  const minutes = minutesUntilStart(startMs, now);
  if (minutes != null) return new Intl.RelativeTimeFormat(intlTag(locale), { numeric: 'always' }).format(minutes, 'minute');
  if (sameCalendarDay(startMs, now)) {
    return new Intl.DateTimeFormat(intlTag(locale), { hour: 'numeric', minute: '2-digit' }).format(new Date(startMs));
  }
  return formatFullDate(startMs, locale);
}

const MOSAIC_CARS = ['/captcha/car1.png', '/captcha/car3.png', '/captcha/car4.png'];
const OTHER_PHOTOS = ['/captcha/other1.png', '/captcha/other2.png', '/captcha/other3.png', '/captcha/other4.png', '/captcha/other5.png', '/captcha/other6.png'];

function shufflePhotos(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

function mixPhotoChallenge() {
  const cars = MOSAIC_CARS.map((src, index) => ({ id: `car-${index}-${src}`, src, match: true }));
  const others = OTHER_PHOTOS.map((src, index) => ({ id: `other-${index}-${src}`, src, match: false }));
  return { label: 'cars', sample: '/captcha/car2.png', tiles: shufflePhotos([...cars, ...others]) };
}

/* ---------- Main page ---------- */
export default function App() {
  const [savedBookings, setSavedBookings] = useState([]);
  const [matchedBookings, setMatchedBookings] = useState([]);
  const [bookingReady, setBookingReady] = useState(false);
  const openedAtRef = useRef(Date.now());
  const [humanVerified, setHumanVerified] = useState(readVerifiedCookie);
  const verifiedOnOpenRef = useRef(readVerifiedCookie());
  const [lock, setLock] = useState(readLock);
  const [now, setNow] = useState(() => Date.now());
  const locale = 'en';
  const t = (key, vars) => translate(locale, key, vars);

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    clearBookingCookies();
  }, []);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const res = await fetch('/api/meetings/next');
        if (!res.ok) throw new Error('next meeting failed');
        const data = await res.json();
        const list = Array.isArray(data.bookings) ? data.bookings : (data.booking ? [data.booking] : []);
        if (stop) return;
        setSavedBookings(list);
        const matched = Array.isArray(data.locationBookings) ? data.locationBookings : [];
        setMatchedBookings(matched.length > 1 ? matched : []);
        if (!readLock() && data.locationGuest) setLock(writeLock(data.locationGuest));
      } catch {
        if (!stop) {
          setSavedBookings([]);
          setMatchedBookings([]);
        }
      } finally {
        if (!stop) setBookingReady(true);
      }
    }
    load();
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      stop = true;
      window.clearInterval(tick);
    };
  }, []);

  const booking = pickPageBooking(matchedBookings.length > 1 ? matchedBookings : savedBookings, now, openedAtRef.current);
  const personalReady = Boolean(lock && now >= lock.start + PERSONAL_HOLD_MS);
  const shownIdRef = useRef('');
  shownIdRef.current = lock?.id || booking?.id || '';
  const startMs = lock ? lock.start : (booking ? Date.parse(booking.startTime) : NaN);
  const upcoming = lock
    ? { id: lock.id, name: lock.name, email: lock.email, startTime: new Date(lock.start).toISOString() }
    : booking;
  const userName = upcoming?.name || '';
  const nameLetter = (userName.trim().split(/\s+/)[0] || '').charAt(0).toUpperCase();
  const email = upcoming?.email || '';
  const organizationName = upcoming ? 'Michael' : '';
  const clientName = [upcoming?.name, organizationName].filter(Boolean).join(` ${t('and')} `);
  const meetTitle = clientName || t('noMeeting');
  const scheduleLabel = t('scheduledFor');
  const waitingUntil = startMs + (lock ? PERSONAL_HOLD_MS : 10 * 60 * 1000);
  const waitingNow = Boolean(
    Number.isFinite(startMs)
    && upcoming
    && !personalReady
    && now >= startMs - WAITING_LEAD_MS
    && now < waitingUntil
  );
  const joinReady = personalReady || Boolean(Number.isFinite(startMs) && (lock || upcoming) && now >= startMs - JOIN_NOW_BEFORE_MS);
  const aloneOnReturn = verifiedOnOpenRef.current && waitingNow;
  const waitingHost = organizationName || 'Michael';
  const waitingLine = t('waiting', { name: waitingHost });
  const scheduleWhen = upcoming ? formatScheduled(startMs, now, locale) : '';
  const minutesSoon = minutesUntilStart(startMs, now) != null;
  const scheduleClock = upcoming ? formatFullDate(startMs, locale) : '';

  useEffect(() => {
    document.title = clientName ? `Meet - ${clientName}` : 'Meet';
  }, [clientName]);

  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mainRef = useRef(null);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [mediaRequested, setMediaRequested] = useState(false);
  const [mediaRequestKey, setMediaRequestKey] = useState({ microphone: 0, camera: 0 });
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [camLive, setCamLive] = useState(false);
  const [mediaState, setMediaState] = useState({ microphone: 'idle', camera: 'idle' });
  const [permissionDialog, setPermissionDialog] = useState(null);
  const [permLeaving, setPermLeaving] = useState(false);
  const permLeavingRef = useRef(false);
  const [bothMicOnly, setBothMicOnly] = useState(false);
  const [permissionChoicesOpen, setPermissionChoicesOpen] = useState(false);
  const [choicesShown, setChoicesShown] = useState(false);
  const [sendResolution, setSendResolution] = useState('Auto');
  const [pushToTalk, setPushToTalk] = useState(false);
  const permissionRef = useRef({ microphone: 'unknown', camera: 'unknown' });
  const [devices, setDevices] = useState({ mics: [], speakers: [], cams: [] });
  const [sel, setSel] = useState({
    mic: '',
    speaker: '',
    cam: '',
  });
  const [showOther, setShowOther] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches,
  );
  const waysRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreShown, setMoreShown] = useState(false);
  const moreRef = useRef(null);
  const [fxMounted, setFxMounted] = useState(false);
  const [fxShown, setFxShown] = useState(false);
  const [camInfoMounted, setCamInfoMounted] = useState(false);
  const [camInfoShown, setCamInfoShown] = useState(false);
  const [fbMounted, setFbMounted] = useState(false);
  const [fbShown, setFbShown] = useState(false);
  const [fbView, setFbView] = useState('menu'); // 'menu' | 'issue' | 'idea'
  const [issueTrying, setIssueTrying] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueOptIn, setIssueOptIn] = useState(false);
  const [issueTryingOpen, setIssueTryingOpen] = useState(false);
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaOptIn, setIdeaOptIn] = useState(false);
  const [tsMounted, setTsMounted] = useState(false);
  const [tsShown, setTsShown] = useState(false);
  const [tsTab, setTsTab] = useState('troubleshoot'); // 'troubleshoot' | 'help'
  const [tsHelpful, setTsHelpful] = useState(null); // null | 'up' | 'down'
  const [tsSearch, setTsSearch] = useState('');
  const [stMounted, setStMounted] = useState(false);
  const [stShown, setStShown] = useState(false);
  const [joinShine, setJoinShine] = useState(true);
  const [joinRingKey, setJoinRingKey] = useState(0);
  const [humanOpen, setHumanOpen] = useState(SHOW_LAST_VERIFY_ONLY);
  const [humanLeaving, setHumanLeaving] = useState(false);
  const humanCloseTimer = useRef(0);
  const humanLeavingRef = useRef(false);
  const [humanChecked, setHumanChecked] = useState(false);
  const [humanShake, setHumanShake] = useState(false);
  const [humanAction, setHumanAction] = useState(null);
  const [humanSpinning, setHumanSpinning] = useState(false);
  const [humanChallenge, setHumanChallenge] = useState(null);
  const [humanPicked, setHumanPicked] = useState([]);
  const [humanWrong, setHumanWrong] = useState(false);
  const [humanSteps, setHumanSteps] = useState(SHOW_LAST_VERIFY_ONLY);
  const welcomeVerify = useRef(() => {});
  const registerWelcomeVerify = (verify) => {
    welcomeVerify.current = verify;
  };
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoNextWash, setPhotoNextWash] = useState('');
  const [photoLeaving, setPhotoLeaving] = useState(false);
  const humanSpinTimer = useRef(0);
  const photoBusyTimer = useRef(0);
  const runAutoVerify = () => {
    welcomeVerify.current();
  };
  const passHumanSteps = () => {
    if (photoLeaving) return;
    writeVerifiedCookie();
    setHumanVerified(true);
    const shown = lock || booking;
    const shownStart = lock ? lock.start : Date.parse(booking?.startTime);
    if (!readLock() && shown && Number.isFinite(shownStart) && Math.abs(Date.now() - shownStart) <= LOCK_WINDOW_MS) {
      setLock(writeLock({ id: shown.id, name: shown.name, email: shown.email, start: shownStart }));
    }
    const shownId = shownIdRef.current;
    if (shownId) {
      fetch('/api/meetings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shownId }),
      }).catch(() => {});
    }
    setPhotoLeaving(true);
    setHumanChecked(true);
    clearTimeout(photoBusyTimer.current);
    photoBusyTimer.current = setTimeout(() => {
      photoBusyTimer.current = 0;
      setPhotoLeaving(false);
      setPhotoBusy(false);
      setHumanChallenge(null);
      setHumanPicked([]);
      setHumanWrong(false);
      setHumanSteps(false);
    }, 320);
  };
  const [joined, setJoined] = useState(false);
  const [asking, setAsking] = useState(false);
  const [joinPhase, setJoinPhase] = useState('');
  const [askDot, setAskDot] = useState(0);
  const [phoneFlash, setPhoneFlash] = useState(false);
  const [phoneFlashMs, setPhoneFlashMs] = useState(750);
  const [desktopNote, setDesktopNote] = useState(false);
  const [desktopNoteLeaving, setDesktopNoteLeaving] = useState(false);
  const phoneFlashTimer = useRef(0);
  const desktopNoteTimer = useRef(0);
  const joinFlowTimers = useRef([]);
  const [captchaMounted, setCaptchaMounted] = useState(false);
  const [captchaScrim, setCaptchaScrim] = useState(false);
  const [captchaShown, setCaptchaShown] = useState(false);
  const [captchaState, setCaptchaState] = useState('idle');
  const [captchaPanel, setCaptchaPanel] = useState(null);
  const [reloadSpin, setReloadSpin] = useState(false);
  const [captchaAnchor, setCaptchaAnchor] = useState(null);
  const [captchaShake, setCaptchaShake] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [verifyWaiting, setVerifyWaiting] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSpring, setOtpSpring] = useState(false);
  const otpRefs = useRef([]);
  const otpSent = useRef('');
  const fxVideoRef = useRef(null);
  const fxTimer = useRef(0);
  const camInfoTimer = useRef(0);
  const captchaCloseTimer = useRef(0);
  const captchaCheckTimer = useRef(0);
  const captchaOpenTimer = useRef(0);
  const signalTimer = useRef(0);
  const signalWatch = useRef(0);
  const rightRef = useRef(null);
  const fbTimer = useRef(0);
  const tsTimer = useRef(0);
  const stTimer = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinDelayDone(true), 2000 + Math.floor(Math.random() * 2001));
    return () => window.clearTimeout(timer);
  }, []);

  const ISSUE_TRYING_OPTS = [
    'Join a meeting',
    'Use audio',
    'Use video',
    'Present / share my screen',
    'Use chat or other features',
    'Something else',
  ];
  const issueCanSend = issueTrying.trim().length > 0 && issueDesc.trim().length > 0;
  const ideaCanSend = ideaDesc.trim().length > 0;

  const loading = !minDelayDone || !bookingReady;

  // Keep preview size tokens in sync for gap / fluid layout (100% Meet sizes)
  useEffect(() => {
    const preview = previewRef.current;
    const main = mainRef.current;
    if (!preview || !main) return undefined;
    const sync = () => {
      main.style.setProperty('--preview-w', `${preview.offsetWidth}px`);
      main.style.setProperty('--preview-h', `${preview.offsetHeight}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(preview);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [loading]);

  useEffect(() => {
    if (!pushToTalk) return undefined;
    let held = false;
    const editable = (target) => target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target?.tagName || '');
    const down = (event) => {
      if (event.code !== 'Space' || event.repeat || editable(event.target) || permissionRef.current.microphone !== 'granted') return;
      event.preventDefault();
      held = true;
      setMicOn(true);
    };
    const release = () => {
      if (!held) return;
      held = false;
      setMicOn(false);
    };
    const up = (event) => { if (event.code === 'Space') release(); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    return () => {
      release();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
    };
  }, [pushToTalk]);

  // Mobile sample shows Companion under Join by default.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const onChange = () => {
      if (mq.matches) setShowOther(true);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /* Effects are informational only; the local preview remains unmodified. */
  const openEffects = () => {
    if (effectsLocked) return;
    setMoreOpen(false);
    clearTimeout(fxTimer.current);
    setFxMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setFxShown(true)));
  };
  const closeEffects = () => {
    setFxShown(false);
    clearTimeout(fxTimer.current);
    fxTimer.current = setTimeout(() => setFxMounted(false), 300);
  };
  const openCamInfo = () => {
    clearTimeout(camInfoTimer.current);
    setCamInfoMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setCamInfoShown(true)));
  };
  const closeCamInfo = () => {
    setCamInfoShown(false);
    clearTimeout(camInfoTimer.current);
    camInfoTimer.current = setTimeout(() => setCamInfoMounted(false), 300);
  };
  const placeCaptcha = () => {
    const el = rightRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCaptchaAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  const openCaptcha = () => {
    clearTimeout(captchaCloseTimer.current);
    clearTimeout(captchaCheckTimer.current);
    clearTimeout(captchaOpenTimer.current);
    setCaptchaState('idle');
    setCaptchaPanel(null);
    setCaptchaShown(false);
    setCaptchaShake(false);
    setCaptchaError(false);
    placeCaptcha();
    setCaptchaMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setCaptchaScrim(true)));
    captchaOpenTimer.current = setTimeout(() => setCaptchaShown(true), 400);
  };
  const stopSignalWatch = () => {
    signalWatch.current += 1;
    clearTimeout(signalTimer.current);
  };
  const closeCaptcha = () => {
    stopSignalWatch();
    clearTimeout(captchaOpenTimer.current);
    clearTimeout(captchaCheckTimer.current);
    setCaptchaShown(false);
    setCaptchaScrim(false);
    clearTimeout(captchaCloseTimer.current);
    captchaCloseTimer.current = setTimeout(() => {
      setCaptchaMounted(false);
      setCaptchaState('idle');
      setCaptchaPanel(null);
      setCaptchaShake(false);
      setCaptchaError(false);
      setVerifyFailed(false);
      setVerifyWaiting(false);
      setOtp(['', '', '', '', '', '']);
      setOtpSpring(false);
      otpSent.current = '';
    }, 300);
  };
  const submitVerify = () => {
    if (captchaState === 'steps') {
      stopSignalWatch();
      const watchId = signalWatch.current;
      setVerifyFailed(false);
      setVerifyWaiting(true);
      signalTimer.current = window.setTimeout(() => {
        if (signalWatch.current !== watchId) return;
        setVerifyWaiting(false);
      }, 2000);
      return;
    }
    if (captchaState === 'idle') setCaptchaError(true);
    setCaptchaShake(false);
    requestAnimationFrame(() => setCaptchaShake(true));
  };
  const applyOtp = (next, focusIndex) => {
    setOtp(next);
    const joined = next.join('');
    if (joined.length === 6 && otpSent.current !== joined) {
      otpSent.current = joined;
      submitVerify();
    }
    if (focusIndex != null) requestAnimationFrame(() => otpRefs.current[focusIndex]?.focus());
  };
  const onOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setOtp(otp.map((digit, i) => (i === index ? '' : digit)));
      otpSent.current = '';
      return;
    }
    const next = [...otp];
    digits.slice(0, 6 - index).split('').forEach((digit, i) => { next[index + i] = digit; });
    const empty = next.findIndex((digit) => !digit);
    applyOtp(next, empty === -1 ? 5 : empty);
  };
  const onOtpKey = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      event.preventDefault();
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      otpSent.current = '';
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const onOtpPaste = (index, event) => {
    const text = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    event.preventDefault();
    const next = [...otp];
    text.slice(0, 6 - index).split('').forEach((digit, i) => { next[index + i] = digit; });
    const empty = next.findIndex((digit) => !digit);
    applyOtp(next, empty === -1 ? 5 : empty);
  };
  const reloadChallenge = () => {
    stopSignalWatch();
    clearTimeout(captchaCheckTimer.current);
    setCaptchaState('idle');
    setCaptchaPanel(null);
    setCaptchaError(false);
    setVerifyFailed(false);
    setVerifyWaiting(false);
    setOtp(['', '', '', '', '', '']);
    setOtpSpring(false);
    otpSent.current = '';
    setReloadSpin(true);
    setTimeout(() => setReloadSpin(false), 450);
  };
  const playAudioChallenge = () => {
    setCaptchaPanel('audio');
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [523.25, 659.25, 783.99, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.32;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
      osc.start(start);
      osc.stop(start + 0.28);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1700);
  };
  const toggleInfo = () => setCaptchaPanel((view) => (view === 'info' ? null : 'info'));
  const verifyHuman = () => {
    if (captchaState !== 'idle') return;
    copyRobotCheck();
    setCaptchaError(false);
    setCaptchaState('checking');
    clearTimeout(captchaCheckTimer.current);
    captchaCheckTimer.current = setTimeout(() => {
      setCaptchaState('passed');
      captchaCheckTimer.current = setTimeout(() => setCaptchaState('steps'), 560);
    }, 1500);
  };
  const isHandheldDevice = () => detectHandheld();
  const [effectsLocked, setEffectsLocked] = useState(isHandheldDevice);
  useEffect(() => {
    const sync = () => setEffectsLocked(isHandheldDevice());
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);
  const flashPhoneJoin = () => {
    clearTimeout(phoneFlashTimer.current);
    clearTimeout(desktopNoteTimer.current);
    const ms = 500 + Math.random() * 500;
    const stay = 5000;
    setPhoneFlash(false);
    setPhoneFlashMs(ms);
    setDesktopNoteLeaving(false);
    requestAnimationFrame(() => {
      setPhoneFlash(true);
      setDesktopNote(true);
    });
    phoneFlashTimer.current = setTimeout(() => {
      setPhoneFlash(false);
      phoneFlashTimer.current = 0;
    }, ms);
    desktopNoteTimer.current = setTimeout(() => {
      setDesktopNoteLeaving(true);
      desktopNoteTimer.current = setTimeout(() => {
        setDesktopNote(false);
        setDesktopNoteLeaving(false);
        desktopNoteTimer.current = 0;
      }, 620);
    }, stay);
  };
  const runJoinAction = (action) => {
    if (action !== 'join' || joinFlowTimers.current.length) return;
    const phase2 = 1000 + Math.random() * 1000;
    let phase3 = 2000 + Math.random() * 2000;
    if (phase2 + phase3 > 5000) phase3 = 5000 - phase2;
    const later = (fn, ms) => {
      joinFlowTimers.current.push(setTimeout(fn, ms));
    };
    setAsking(true);
    setJoinPhase('joining');
    later(() => setJoinPhase('hiccup'), phase2);
    const flash = 1800 * 1.3;
    later(() => setJoinPhase('flash'), phase2 + phase3);
    later(() => {
      window.location.replace('https://meet.google.com/');
    }, phase2 + phase3 + flash);
  };
  const openHuman = (action) => {
    if (action === 'join' || action === 'companion' || action === 'present') {
      writeJoinCookie();
    }
    if (action === 'join' && isPhoneJoinBlock()) {
      flashPhoneJoin();
      return;
    }
    if (isHandheldDevice()) return;
    if (humanVerified || SKIP_HUMAN_VERIFY) {
      if (action === 'join') runJoinAction('join');
      return;
    }
    clearTimeout(humanCloseTimer.current);
    humanLeavingRef.current = false;
    setHumanLeaving(false);
    clearTimeout(humanSpinTimer.current);
    clearTimeout(photoBusyTimer.current);
    setHumanChecked(false);
    setHumanShake(false);
    setHumanSpinning(false);
    setHumanChallenge(null);
    setHumanPicked([]);
    setHumanWrong(false);
    setHumanSteps(false);
    setPhotoBusy(false);
    setPhotoNextWash('');
    setPhotoLeaving(false);
    setHumanAction(action);
    setHumanOpen(true);
  };
  const closeHuman = () => {
    if (!humanOpen || humanLeavingRef.current) return;
    humanLeavingRef.current = true;
    setHumanLeaving(true);
    clearTimeout(humanSpinTimer.current);
    clearTimeout(photoBusyTimer.current);
    setHumanSpinning(false);
    setHumanChallenge(null);
    setHumanSteps(false);
    setPhotoBusy(false);
    setPhotoNextWash('');
    clearTimeout(humanCloseTimer.current);
    humanCloseTimer.current = setTimeout(() => {
      humanLeavingRef.current = false;
      setHumanOpen(false);
      setHumanLeaving(false);
    }, 226);
  };
  const beginPhotoCheck = () => {
    if (humanSpinning || humanChallenge || humanChecked || humanSteps || photoBusy) return;
    setHumanShake(false);
    setHumanSpinning(true);
    clearTimeout(humanSpinTimer.current);
    const wait = 1000 + Math.random() * 1000;
    humanSpinTimer.current = setTimeout(() => {
      setHumanSpinning(false);
      setHumanPicked([]);
      setHumanWrong(false);
      setHumanChallenge(mixPhotoChallenge());
    }, wait);
  };
  const reloadPhotoCheck = () => {
    setHumanWrong(false);
    setHumanPicked([]);
    setHumanChallenge(mixPhotoChallenge());
  };
  const togglePhoto = (id) => {
    setHumanWrong(false);
    setHumanPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  const submitPhotos = () => {
    if (!humanChallenge || photoBusy || photoNextWash) return;
    const needed = humanChallenge.tiles.filter((tile) => tile.match).map((tile) => tile.id).sort().join('|');
    const got = [...humanPicked].sort().join('|');
    if (needed && needed === got) {
      setPhotoNextWash('full');
      clearTimeout(photoBusyTimer.current);
      photoBusyTimer.current = setTimeout(() => {
        setPhotoNextWash('half');
        photoBusyTimer.current = setTimeout(() => {
          photoBusyTimer.current = 0;
          setPhotoNextWash('');
          setHumanChallenge(null);
          setHumanPicked([]);
          setHumanWrong(false);
          setHumanSteps(true);
        }, 200);
      }, 800);
      return;
    }
    setHumanWrong(false);
    requestAnimationFrame(() => setHumanWrong(true));
    setHumanPicked([]);
  };
  const dismissPhotoCheck = () => {
    clearTimeout(photoBusyTimer.current);
    setPhotoBusy(false);
    setPhotoNextWash('');
    setHumanChallenge(null);
    setHumanPicked([]);
    setHumanWrong(false);
    setHumanSteps(false);
  };
  const onHumanScrimDown = (event) => {
    if (event.target.closest('.photo-challenge')) return;
    if (event.target.closest('.human-close')) return;
    if (humanChallenge || humanSteps) dismissPhotoCheck();
  };
  const confirmHuman = () => {
    if (humanSpinning || humanChallenge || humanSteps || photoBusy || !humanChecked) {
      setHumanShake(false);
      requestAnimationFrame(() => setHumanShake(true));
      return;
    }
    const action = humanAction;
    closeHuman();
    runJoinAction(action);
  };
  const onJoin = () => openHuman('join');
  useEffect(() => {
    if (!asking) return undefined;
    const timer = window.setInterval(() => setAskDot((dot) => (dot + 1) % 4), 1000);
    return () => window.clearInterval(timer);
  }, [asking]);
  useEffect(() => {
    if (!captchaMounted) return undefined;
    const el = rightRef.current;
    if (!el) return undefined;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setCaptchaAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const frame = el.parentElement;
    if (frame) ro.observe(frame);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [captchaMounted]);
  useEffect(() => () => {
    clearTimeout(captchaCloseTimer.current);
    clearTimeout(captchaCheckTimer.current);
    clearTimeout(captchaOpenTimer.current);
    clearTimeout(signalTimer.current);
    clearTimeout(humanSpinTimer.current);
    clearTimeout(photoBusyTimer.current);
    clearTimeout(phoneFlashTimer.current);
    clearTimeout(desktopNoteTimer.current);
    joinFlowTimers.current.forEach((id) => clearTimeout(id));
  }, []);

  /* Report a problem: idle 1.5s, then milky scrim + panel slides right→left */
  const openFeedback = () => {
    setMoreOpen(false);
    setFbView('menu');
    setIssueTrying('');
    setIssueDesc('');
    setIssueOptIn(false);
    setIssueTryingOpen(false);
    setIdeaDesc('');
    setIdeaOptIn(false);
    clearTimeout(fbTimer.current);
    setFbMounted(false);
    setFbShown(false);
    fbTimer.current = setTimeout(() => {
      setFbMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setFbShown(true)));
    }, 1500);
  };
  const closeFeedback = () => {
    setFbShown(false);
    setIssueTryingOpen(false);
    clearTimeout(fbTimer.current);
    fbTimer.current = setTimeout(() => {
      setFbMounted(false);
      setFbView('menu');
      setIssueTrying('');
      setIssueDesc('');
      setIssueOptIn(false);
      setIdeaDesc('');
      setIdeaOptIn(false);
    }, 280);
  };
  const openIssueForm = () => {
    setIssueTryingOpen(false);
    setFbView('issue');
  };
  const openIdeaForm = () => {
    setIssueTryingOpen(false);
    setFbView('idea');
  };
  const backToFeedbackMenu = () => {
    setIssueTryingOpen(false);
    setFbView('menu');
  };
  const openTroubleshooting = () => {
    setMoreOpen(false);
    setTsHelpful(null);
    setTsTab('troubleshoot');
    setTsSearch('');
    clearTimeout(tsTimer.current);
    setTsMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setTsShown(true)));
  };
  const closeTroubleshooting = () => {
    setTsShown(false);
    clearTimeout(tsTimer.current);
    tsTimer.current = setTimeout(() => {
      setTsMounted(false);
      setTsHelpful(null);
      setTsTab('troubleshoot');
      setTsSearch('');
    }, 280);
  };
  const openSettings = () => {
    setMoreOpen(false);
    clearTimeout(stTimer.current);
    setStMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setStShown(true)));
  };
  const closeSettings = () => {
    setStShown(false);
    clearTimeout(stTimer.current);
    stTimer.current = setTimeout(() => setStMounted(false), 280);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      const key = e.key.toLowerCase();
      if (key === 'd') { e.preventDefault(); micOn ? setMicOn(false) : requestInput('microphone'); }
      if (key === 'e') { e.preventDefault(); camOn ? setCamOn(false) : requestInput('camera'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [micOn, camOn]);

  // Native device lists become useful after the user grants permission.
  useEffect(() => {
    async function load() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const next = {
          mics: prepareDevices(list, 'audioinput', t('microphone')),
          speakers: prepareDevices(list, 'audiooutput', t('speakers')),
          cams: prepareDevices(list, 'videoinput', t('camera')),
        };
        setDevices(next);
        setSel((s) => ({
          mic: next.mics.some((d) => d.id === s.mic) ? s.mic : (next.mics[0]?.id || ''),
          speaker: next.speakers.some((d) => d.id === s.speaker) ? s.speaker : (next.speakers[0]?.id || ''),
          cam: s.cam || next.cams[0]?.id || '',
        }));
      } catch {
        setDevices((prev) => prev);
      }
    }
    load();
    const md = navigator.mediaDevices;
    md?.addEventListener?.('devicechange', load);
    return () => md?.removeEventListener?.('devicechange', load);
  }, [locale]);

  function useInput(kind, enabled, deviceId, requestKey, setInput) {
    useEffect(() => {
      let active = true;
      let acquired = null;
      if (!mediaRequested || !enabled || !navigator.mediaDevices?.getUserMedia) {
        setInput(null);
        setMediaState((state) => ({ ...state, [kind]: enabled ? 'idle' : 'off' }));
        return undefined;
      }
      setMediaState((state) => ({ ...state, [kind]: 'pending' }));
      acquireMediaInputs(navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices), {
        micOn: kind === 'microphone', camOn: kind === 'camera', micId: kind === 'microphone' ? deviceId : '', camId: kind === 'camera' ? deviceId : '',
      }, (inputKind, next, state) => {
        if (!active) { next?.getTracks().forEach((track) => track.stop()); return; }
        if (inputKind !== kind) return;
        acquired = next;
        setInput(next);
        if (state === 'ready') permissionRef.current[kind] = 'granted';
        else if (state === 'denied') permissionRef.current[kind] = 'denied';
        setMediaState((previous) => ({ ...previous, [kind]: state }));
        if (kind === 'camera') setCamLive(Boolean(next?.getVideoTracks()[0]));
      }).then(() => {
        if (!active) return;
        navigator.mediaDevices.enumerateDevices?.().then((list) => {
          if (active) setDevices({ mics: prepareDevices(list, 'audioinput', t('microphone')), speakers: prepareDevices(list, 'audiooutput', t('speakers')), cams: prepareDevices(list, 'videoinput', t('camera')) });
        }).catch(() => {});
      });
      return () => { active = false; acquired?.getTracks().forEach((track) => track.stop()); };
    }, [enabled, deviceId, requestKey]);
  }
  useInput('microphone', micOn, sel.mic, mediaRequestKey.microphone, setAudioStream);
  useInput('camera', camOn, sel.cam, mediaRequestKey.camera, setVideoStream);

  useEffect(() => {
    const tracks = [...(audioStream?.getAudioTracks() || []), ...(videoStream?.getVideoTracks() || [])];
    setStream(tracks.length ? new MediaStream(tracks) : null);
  }, [audioStream, videoStream]);

  useEffect(() => () => {
    clearTimeout(fxTimer.current);
    clearTimeout(camInfoTimer.current);
    clearTimeout(tsTimer.current);
    clearTimeout(stTimer.current);
  }, []);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMoreOpen(false); };
    /* pointerdown covers mouse + touch (mousedown alone misses many mobile taps) */
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  /* Join ring: 2× → 3.2× → 1.2×; replay on tab return; dismiss on elsewhere click */
  useEffect(() => {
    const replay = () => {
      setJoinShine(true);
      setJoinRingKey((k) => k + 1);
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') replay();
    };
    const onPageShow = (e) => {
      if (e.persisted) replay();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  useEffect(() => {
    if (!joinShine) return undefined;
    const dismiss = (e) => {
      if (e.target?.closest?.('.join-wrap')) return;
      setJoinShine(false);
    };
    document.addEventListener('pointerdown', dismiss, true);
    document.addEventListener('mousedown', dismiss, true);
    document.addEventListener('touchstart', dismiss, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss, true);
      document.removeEventListener('mousedown', dismiss, true);
      document.removeEventListener('touchstart', dismiss, true);
    };
  }, [joinShine]);

  useEffect(() => {
    if (!fxMounted && !camInfoMounted && !fbMounted && !tsMounted && !stMounted && !captchaMounted && !humanOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (captchaMounted) { closeCaptcha(); return; }
      if (stMounted) { closeSettings(); return; }
      if (fbMounted) {
        if (fbView === 'issue' || fbView === 'idea') backToFeedbackMenu();
        else closeFeedback();
        return;
      }
      if (tsMounted) { closeTroubleshooting(); return; }
      if (camInfoMounted) closeCamInfo();
      else closeEffects();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fxMounted, camInfoMounted, fbMounted, fbView, tsMounted, stMounted, captchaMounted, humanOpen]);

  useEffect(() => () => clearTimeout(fbTimer.current), []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    el.srcObject = stream || null;
    if (!stream) {
      setCamLive(false);
      return undefined;
    }
    const markLive = () => setCamLive(stream.getVideoTracks().some((track) => track.readyState === 'live'));
    el.addEventListener('loadeddata', markLive);
    el.addEventListener('playing', markLive);
    el.play?.().then(markLive).catch(() => {});
    return () => {
      el.removeEventListener('loadeddata', markLive);
      el.removeEventListener('playing', markLive);
    };
  }, [stream, camOn, loading]);

  useEffect(() => {
    if (fxVideoRef.current) {
      fxVideoRef.current.srcObject = stream || null;
      if (stream) fxVideoRef.current.play?.().catch(() => {});
    }
  }, [stream, fxMounted, camOn]);

  /* Keep independent input status accurate if a device disconnects mid-preview. */
  useEffect(() => {
    if (!stream) {
      setCamLive(false);
      return undefined;
    }
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    const syncVideo = () => setCamLive(videoTrack?.readyState === 'live');
    const onVideoEnded = () => {
      setCamLive(false);
      setMediaState((state) => ({ ...state, camera: 'notfound' }));
    };
    const onAudioEnded = () => setMediaState((state) => ({ ...state, microphone: 'notfound' }));
    syncVideo();
    videoTrack?.addEventListener('ended', onVideoEnded);
    videoTrack?.addEventListener('mute', syncVideo);
    videoTrack?.addEventListener('unmute', syncVideo);
    audioTrack?.addEventListener('ended', onAudioEnded);
    return () => {
      videoTrack?.removeEventListener('ended', onVideoEnded);
      videoTrack?.removeEventListener('mute', syncVideo);
      videoTrack?.removeEventListener('unmute', syncVideo);
      audioTrack?.removeEventListener('ended', onAudioEnded);
    };
  }, [stream]);

  const camFound = camLive;
  const micPermissionNeeded = !mediaRequested && !micOn;
  const camPermissionNeeded = !mediaRequested && !camOn;
  const labelOf = (arr, id, empty) => arr.find((d) => d.id === id)?.label || empty;
  const inputLabel = (name, state) => {
    if (state === 'pending') return t('deviceStarting', { name });
    if (state === 'denied') return t('deviceBlocked', { name });
    if (state === 'busy') return t('deviceBusy', { name });
    if (state === 'notfound') return t('deviceMissing', { name });
    if (state === 'off') return t('deviceOff', { name });
    return name;
  };
  const requestMedia = (kinds = ['microphone', 'camera']) => {
    setMediaRequested(true);
    setMediaRequestKey((keys) => ({ ...keys, ...Object.fromEntries(kinds.map((kind) => [kind, keys[kind] + 1])) }));
  };
  const requestInput = (kind) => {
    if (permissionRef.current[kind] === 'granted') {
      if (kind === 'microphone') setMicOn(true); else setCamOn(true);
      requestMedia([kind]);
    } else setPermissionDialog(kind);
  };
  const closePermissionDialog = () => {
    if (!permissionDialog || permLeavingRef.current) return;
    permLeavingRef.current = true;
    setPermLeaving(true);
    window.setTimeout(() => {
      permLeavingRef.current = false;
      setPermLeaving(false);
      setPermissionDialog(null);
      setPermissionChoicesOpen(false);
      setChoicesShown(false);
    }, 280);
  };
  const allowDevices = (wantsMic, wantsCam) => {
    if (wantsMic) setMicOn(true);
    if (wantsCam) setCamOn(true);
    requestMedia([...(wantsMic ? ['microphone'] : []), ...(wantsCam ? ['camera'] : [])]);
    closePermissionDialog();
  };
  const confirmPermission = () => {
    const wantsMic = permissionDialog === 'microphone' || permissionDialog === 'both';
    const wantsCam = permissionDialog === 'camera' || (permissionDialog === 'both' && !bothMicOnly);
    allowDevices(wantsMic, wantsCam);
  };
  const dismissPermission = () => {
    if (permLeavingRef.current) return;
    if (permissionDialog === 'microphone' || permissionDialog === 'both') setMicOn(false);
    if (permissionDialog === 'camera' || permissionDialog === 'both') setCamOn(false);
    closePermissionDialog();
  };
  useEffect(() => {
    if (!permissionDialog) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') dismissPermission(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [permissionDialog]);

  const applySendResolution = async (label) => {
    const sizes = { 'Full high definition (1080p)': [1920, 1080], 'High definition (720p)': [1280, 720], 'Standard definition (360p)': [640, 360] };
    const [width, height] = sizes[label] || [];
    const track = videoStream?.getVideoTracks()[0];
    if (track?.applyConstraints) await track.applyConstraints(width ? { width: { ideal: width }, height: { ideal: height } } : {});
    setSendResolution(label);
  };
  useEffect(() => { applySendResolution(sendResolution).catch(() => {}); }, [videoStream]);

  return (
    <div className="page">
      {(joinPhase === 'hiccup' || joinPhase === 'flash') && (
        <div className={`net-hiccup${joinPhase === 'flash' ? ' is-flash' : ''}`}>
          <div className="net-dim" />
          {joinPhase === 'hiccup' && (
            <div className="net-toast" role="status">
              <span className="net-toast-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5a10 10 0 0 1 14 0" />
                  <path d="M8.2 15.4a5.5 5.5 0 0 1 7.6 0" />
                  <path d="M12 18.5h.01" />
                  <path d="M4 5l16 16" />
                </svg>
              </span>
              <span>You lost your network connection. Trying to reconnect...</span>
            </div>
          )}
        </div>
      )}
      {desktopNote && (
        <div className={`desktop-note${desktopNoteLeaving ? ' is-leaving' : ''}`} role="status">
          <span className="desktop-note-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="1.5" />
              <path d="M8 20h8M12 16v4" />
            </svg>
          </span>
          <div className="desktop-note-copy">
            <div className="desktop-note-title">Desktop Required</div>
            <p>For the best experience, please join the meeting on a desktop or laptop computer.</p>
          </div>
        </div>
      )}
      {/* Top-right account area */}
      <header className="topbar">
        <a className="brand" href="https://meet.google.com/" aria-label="Meet">
          <img className="brand-mark" src="/meet-mark.png" alt="" />
          <span className="brand-word">Meet</span>
        </a>
        <div className="topbar-end">
        {upcoming && (
        <div className="account-row">
          <div className="account">
            <div className="email" title={email}>{email}</div>
            <a className="switch" href="#">{t('switchAccount')}</a>
          </div>
          <span className="avatar" aria-hidden="true">{nameLetter}</span>
        </div>
        )}
        </div>
      </header>

      <main className="main" ref={mainRef}>
        {loading ? (
          <section className="lobby loading-lobby" aria-live="polite"><div className="lobby-frame">
            <div className="preview loading-preview" aria-hidden="true">
              <video ref={videoRef} autoPlay muted playsInline className={`loading-video${camLive ? ' on' : ''}`} />
            </div>
            <section className="right loading-copy">
              <div className="loading-line">{t('gettingReady')}</div>
              <p>{t('joinMoment')}</p>
              <LoadingSpinner />
            </section>
          </div></section>
        ) : joined ? (
          <section className="lobby loading-lobby" aria-live="polite">
            <div className="lobby-frame">
              <section className="right loading-copy">
                <div className="loading-line">{t('joining')}</div>
                <p>{meetTitle}</p>
                <LoadingSpinner />
              </section>
            </div>
          </section>
        ) : (<>
        {/*
          lobby-frame height = camera only. The top of the join button sits 5% of
          the camera height below the camera’s middle. Title stays above it; other ways stay below.
        */}
        <div className="lobby">
          <div className="lobby-frame">
            <div className="preview" ref={previewRef}>
              <div className="more-anchor" ref={moreRef}>
                <div className="preview-top">
                  <span className="name">{userName}</span>
                  <button
                    type="button"
                    className="icon-btn more-options-btn"
                    aria-label={t('moreOptions')}
                    aria-expanded={moreOpen}
                    aria-haspopup="menu"
                    disabled={effectsLocked}
                    onClick={() => {
                      if (effectsLocked) return;
                      if (moreOpen) setMoreOpen(false);
                      else { setMoreShown(true); setMoreOpen(true); }
                    }}
                  >
                    <Dots />
                    <span className="more-tip" role="tooltip">{t('moreOptions')}</span>
                  </button>
                </div>
                {moreShown && !effectsLocked && <div
                  className={`more-pop${moreOpen ? ' open' : ' is-leaving'}`}
                  onAnimationEnd={(event) => {
                    if (event.target !== event.currentTarget || moreOpen) return;
                    if (event.animationName === 'more-menu-out') setMoreShown(false);
                  }}
                >
                  <div className="more-pop-inner">
                    <div className="more-menu" role="menu" aria-label={t('moreOptions')}>
                      <button type="button" role="menuitem" onClick={openEffects} disabled={effectsLocked}><MenuEffectsIcon />{t('effects')}</button>
                      <div className="more-rule" />
                      <button type="button" role="menuitem" onClick={openFeedback}><FlagIcon />{t('report')}</button>
                      <button type="button" role="menuitem" onClick={openTroubleshooting}><HelpIcon />{t('help')}</button>
                      <button type="button" role="menuitem" onClick={openSettings}><GearIcon />{t('settings')}</button>
                    </div>
                  </div>
                </div>}
              </div>

              {camOn && (
                <video ref={videoRef} autoPlay muted playsInline className={`video${camFound ? ' on' : ''}`} />
              )}
              {camOn && !camFound && (
                <div className="preview-msg">
                  {mediaState.camera === 'pending' ? <div className="msg-title">{t('cameraStarting')}</div>
                    : mediaState.camera === 'notfound' ? <><div className="msg-title"><Warn size={18} /> {t('cameraNotFound')}</div><div className="msg-sub">{t('cameraPlug')}</div></>
                      : mediaState.camera === 'busy' ? <><div className="msg-title"><Warn size={18} /> {t('cameraBusy')}</div><div className="msg-sub">{t('cameraBusySub')}</div><button type="button" className="permission-btn" onClick={() => requestMedia(['camera'])}>{t('tryAgain')}</button></>
                      : mediaState.camera === 'denied' ? <><div className="msg-title"><Warn size={18} /> {t('cameraBlocked')}</div><div className="msg-sub">{t('cameraBlockedSub')}</div><button type="button" className="permission-btn" onClick={() => requestMedia(['camera'])}>{t('tryAgain')}</button></>
                        : <><div className="msg-title">{t('allowPrompt')}</div><button type="button" className="permission-btn" onClick={() => { setBothMicOnly(false); setPermissionChoicesOpen(false); setPermissionDialog('both'); }}>{t('allowMicCam')}</button></>}
                </div>
              )}
              {!camOn && !micOn && !mediaRequested && (
                <div className="preview-msg">
                  <div className="msg-title">{t('allowPrompt')}</div>
                  <button type="button" className="permission-btn" onClick={() => { setBothMicOnly(false); setPermissionChoicesOpen(false); setPermissionDialog('both'); }}>{t('allowMicCam')}</button>
                </div>
              )}
              {!camOn && (micOn || mediaRequested) && <div className="preview-msg"><div className="msg-title off">{t('cameraOff')}</div></div>}
              {mediaState.microphone === 'denied' || mediaState.microphone === 'notfound' || mediaState.microphone === 'busy' ? (
                <div className="media-alert" role="status">
                  {mediaState.microphone === 'busy' ? t('micBusy') : mediaState.microphone === 'notfound' ? t('micMissing') : t('micBlocked')}
                  <button type="button" onClick={() => requestMedia(['microphone'])}>{t('tryAgain')}</button>
                </div>
              ) : null}

              {micOn && (
                <button className="more-btn" aria-label={t('moreOptions')}>
                  <ListeningDots active stream={stream} />
                </button>
              )}

              <div className="controls">
                <button className={`round ${micOn || micPermissionNeeded ? '' : 'off'}`} onClick={() => { if (micOn) setMicOn(false); else requestInput('microphone'); }}
                        aria-label={micOn ? t('micOffTip') : t('micOnTip')}>
                  {micOn || micPermissionNeeded ? <CtrlMicIcon /> : <CtrlMicOffIcon />}
                  {micPermissionNeeded && <span className="badge"><Warn size={16} pill /></span>}
                  <span className="round-tip" role="tooltip">{micOn ? t('micOffTip') : t('micOnTip')}</span>
                </button>
                <button className={`round ${camOn ? '' : 'off'}`} onClick={() => { if (camOn) setCamOn(false); else requestInput('camera'); }}
                        aria-label={camOn ? t('camOffTip') : t('camOnTip')}>
                  {camOn ? <CamIcon /> : <CamOffIcon />}
                  {camOn && !camFound && <span className="badge"><Warn size={16} pill /></span>}
                  <span className="round-tip" role="tooltip">{camOn ? t('camOffTip') : t('camOnTip')}</span>
                </button>
              </div>

            </div>

            <section ref={rightRef} className={`right ${showOther ? 'spread' : ''}`}>
              <div className="right-copy">
              {meetTitle && <h1 className="meet-title" title={meetTitle}>{meetTitle}</h1>}
              {(personalReady || upcoming) && (
                <div className="schedule">
                  <div key={personalReady || aloneOnReturn ? 'alone' : waitingNow ? 'wait' : 'time'} className="schedule-swap">
                  {personalReady || aloneOnReturn ? (
                    <div className="schedule-when is-alone">{t('noOneElse')}</div>
                  ) : waitingNow ? (
                    <div className="schedule-when is-holding is-waiting">
                      <span className="wait-avatar"><img src="/michael-avatar.png" alt="" /></span>
                      <span>{waitingLine}</span>
                    </div>
                  ) : (
                    <>
                      {minutesSoon ? null : <div className="schedule-label"><CalendarIcon /> <span>{scheduleLabel}</span></div>}
                      <div className={`schedule-when${minutesSoon ? ' is-soon' : ''}`} title={scheduleClock}>{scheduleWhen}</div>
                    </>
                  )}
                  </div>
                </div>
              )}
              </div>
              <div key={joinRingKey} className={`join-wrap ${joinShine ? 'has-ring' : ''}`}>
                {!camFound && (
                  <span className="join-warn">
                    <span className="join-warn-tip" role="tooltip">{t('noCam')}</span>
                    <Warn size={16} />
                  </span>
                )}
                <button type="button" className={`join${joinReady && !asking ? ' is-now' : ''}${asking ? ' is-asking' : ''}${phoneFlash ? ' is-phone-flash' : ''}`} style={phoneFlash ? { '--phone-flash': `${phoneFlashMs}ms` } : undefined} onClick={onJoin} disabled={asking}>
                  {asking && <span className="join-spin" aria-hidden="true" />}
                  <span className="join-label" key={asking ? 'joining' : 'ready'}>{asking ? 'Joining...' : (personalReady ? t('readyToJoin') : (joinReady ? t('joinNow') : t('joinAnyway')))}</span>
                </button>
              </div>
              <div className="other-wrap">
                <div className={`more-ways ${showOther ? 'open' : ''}`} inert={showOther ? undefined : ''}>
                  <div className="more-ways-inner">
                    <div className="more-ways-stack" ref={waysRef}>
                      <button className="way" type="button" onClick={() => openHuman('companion')}>
                        <CompanionIcon /> {t('companion')}
                      </button>
                      <button className="way way-present" type="button" onClick={() => openHuman('present')}>
                        <PresentIcon /> {t('present')}
                      </button>
                    </div>
                  </div>
                </div>
                <button className={`other ${showOther ? 'open' : ''}`} onClick={() => setShowOther(!showOther)}
                        aria-expanded={showOther}>
                  {showOther ? t('fewer') : t('otherWays')} <Chevron />
                </button>
              </div>
            </section>
          </div>

          <div className="devices">
            <DeviceSelect icon={<ChipMic />} disabled={micPermissionNeeded} meter meterStream={stream} options={devices.mics} value={sel.mic}
              label={micPermissionNeeded ? t('permissionNeeded') : labelOf(devices.mics, sel.mic, inputLabel(t('microphone'), mediaState.microphone))}
              onChange={(id) => setSel({ ...sel, mic: id })} />
            <DeviceSelect icon={<ChipSpeaker />} disabled={!mediaRequested} testSpeakers options={devices.speakers} value={sel.speaker}
              label={!mediaRequested ? t('permissionNeeded') : labelOf(devices.speakers, sel.speaker, t('speakers'))}
              onChange={(id) => setSel({ ...sel, speaker: id })} />
            <DeviceSelect icon={<ChipCam />} disabled={camPermissionNeeded} cameraMissing={mediaState.camera === 'notfound'} onCameraInfo={openCamInfo} options={devices.cams} value={sel.cam}
              label={camPermissionNeeded ? t('permissionNeeded') : camFound ? labelOf(devices.cams, sel.cam, t('camera')) : inputLabel(t('camera'), mediaState.camera)}
              onChange={(id) => setSel({ ...sel, cam: id })} />
            <EffectsChip enabled={camOn && !effectsLocked} label={camOn ? t('effects') : t('permissionNeeded')} menuLabel={t('chooseEffects')} onChoose={openEffects} />
          </div>
        </div>
        </>)}
      </main>

      {permissionDialog && (
        <div className={`perm-scrim${permLeaving ? ' is-leaving' : ''}`} role="presentation" onMouseDown={dismissPermission}>
          <section className={`perm-dialog${permLeaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="perm-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="perm-close" aria-label={t('close')} onClick={dismissPermission}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <img src="/perm-hero.png" alt="" className="perm-hero" />
            <h2 id="perm-title">{permissionDialog === 'microphone' ? t('permHear') : permissionDialog === 'camera' ? t('permCamera') : t('permBoth')}</h2>
            <p>{permissionDialog === 'microphone' ? t('permHearSub') : permissionDialog === 'camera' ? t('permCamSub') : t('permBothSub')}</p>
            {permissionDialog === 'camera' ? (
              <div className="perm-actions">
                <div className="perm-split">
                  <button type="button" className="perm-primary" onClick={confirmPermission}>{t('useCam')}</button>
                </div>
              </div>
            ) : (
              <div className="perm-actions stack">
                <button type="button" className="perm-primary" onClick={() => allowDevices(true, false)}><PermBtnMic /> {t('useMic')}</button>
                <button type="button" className="perm-outline" onClick={() => allowDevices(true, true)}><PermBtnCam /> {t('useBoth')}</button>
              </div>
            )}
          </section>
        </div>
      )}

      {humanOpen && (
        <div className={`human-scrim${humanLeaving ? ' is-leaving' : ''}`} onMouseDown={onHumanScrimDown}>
          <div
            className={`human-dialog${humanLeaving ? ' is-leaving' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="human-title"
          >
            <button type="button" className="human-close" aria-label={t('close')} onClick={closeHuman}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h2 id="human-title">{t('confirmHuman')}</h2>
            <div
              className={`human-widget${humanShake ? ' shake' : ''}`}
              onAnimationEnd={() => setHumanShake(false)}
            >
              <button
                type="button"
                className={`human-check${humanSpinning ? ' is-spin' : ''}`}
                role="checkbox"
                aria-checked={humanChecked}
                aria-busy={humanSpinning}
                onClick={beginPhotoCheck}
              >
                {humanSpinning ? (
                  <svg className="human-arc" viewBox="0 0 26 26" aria-hidden="true">
                    <circle cx="13" cy="13" r="10" />
                  </svg>
                ) : (
                  <span className={`human-box${humanChecked ? ' on' : ''}`} aria-hidden="true">
                    {humanChecked && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                )}
                {t('notRobot')}
              </button>
              <div className="human-brand">
                <img src="/recaptcha-logo.png" alt="" />
                <span>reCAPTCHA</span>
              </div>
            </div>
            <button type="button" className="human-continue" onClick={confirmHuman}>{t('continue')}</button>
          {(humanChallenge || humanSteps || photoLeaving) && (
            <section className={`photo-challenge${humanWrong ? ' is-wrong' : ''}${humanSteps ? ' is-steps' : ''}${photoLeaving ? ' is-leaving' : ''}`} aria-label={humanSteps ? t('verifySteps') : t('photoCheck')}>
              <div className="photo-head">
                {humanSteps ? (
                  <p>{t('completeThese')}<strong>{t('verificationSteps')}</strong></p>
                ) : (
                  <>
                    <p>{t('selectImages')} <strong>{t('cars')}</strong></p>
                    <img src={humanChallenge.sample} alt="" />
                  </>
                )}
              </div>
              {humanChallenge && (
                <div className="photo-grid">
                  {humanChallenge.tiles.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      className={`photo-tile${humanPicked.includes(tile.id) ? ' on' : ''}`}
                      aria-pressed={humanPicked.includes(tile.id)}
                      onClick={() => togglePhoto(tile.id)}
                    >
                      <img src={tile.src} alt="" />
                    </button>
                  ))}
                </div>
              )}
              {humanSteps && (
                <div className="photo-blank">
                  <WelcomeWebsitePage onVerifyReady={registerWelcomeVerify} onAutoVerify={runAutoVerify} onPassed={passHumanSteps} onBusy={setPhotoBusy} />
                </div>
              )}
              <div className="photo-foot">
                <button type="button" className="photo-tool" aria-label="New photos" onClick={humanSteps ? undefined : reloadPhotoCheck}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
                </button>
                <button type="button" className="photo-tool" aria-label="Audio" tabIndex={-1}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z" /></svg>
                </button>
                <button type="button" className="photo-tool" aria-label="Info" tabIndex={-1}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" /></svg>
                </button>
                <button type="button" className={`photo-verify${photoNextWash === 'full' ? ' is-gray' : ''}${photoNextWash === 'half' ? ' is-half' : ''}${photoBusy && humanSteps ? ' is-holding' : ''}`} onClick={humanSteps ? () => welcomeVerify.current() : submitPhotos} disabled={photoBusy || Boolean(photoNextWash)}>
                  <span className="photo-verify-gray" aria-hidden="true" />
                  <span className="photo-verify-label">{humanSteps ? 'VERIFY' : 'NEXT'}</span>
                </button>
              </div>
            </section>
          )}
          </div>
        </div>
      )}


      {camInfoMounted && (
        <div className={`fx-scrim ${camInfoShown ? 'show' : ''}`} onMouseDown={closeCamInfo}>
          <div className="cam-dialog" role="dialog" aria-modal="true" aria-labelledby="cam-info-title"
               onMouseDown={(e) => e.stopPropagation()}>
            <span className="cam-info-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 11.2V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="8.1" r="1" fill="currentColor" />
              </svg>
            </span>
            <h2 id="cam-info-title">Camera not found</h2>
            <p>Make sure your camera is plugged in</p>
            <div className="cam-dialog-actions">
              <button type="button" className="cam-dismiss" onClick={closeCamInfo}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {fxMounted && (
        <div className={`fx-scrim ${fxShown ? 'show' : ''}`} onMouseDown={closeEffects}>
          <div className="fx-dialog" role="dialog" aria-modal="true" aria-labelledby="fx-title"
               onMouseDown={(e) => e.stopPropagation()}>
            <div className="fx-head">
              <h2 id="fx-title">Backgrounds and effects</h2>
              <button className="fx-close" aria-label="Close" onClick={closeEffects}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="fx-body">
              <div className="fx-preview">
                {camOn && camFound ? (
                  <video ref={fxVideoRef} autoPlay muted playsInline className="fx-video" />
                ) : (
                  <div className="fx-msg">
                    {camOn ? <><Warn size={20} /> Camera not found</> : 'Camera is off'}
                  </div>
                )}
              </div>
              <div className="fx-side">
                <span className="fx-alert" aria-hidden="true">!</span>
                <p className="fx-side-title">Configure your browser for visual effects</p>
                <p className="fx-side-copy">To use visual effects, turn on hardware acceleration in your browser settings</p>
                <a className="fx-link" href="https://support.google.com/meet/answer/10058482?hl=en&expand_all_zippies=true#requirements" target="_blank" rel="noreferrer">Learn more</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {fbMounted && (
        <>
          <div className={`fb-scrim ${fbShown ? 'show' : ''}`} onMouseDown={closeFeedback} aria-hidden="true" />
          <aside
            className={`fb-panel ${fbShown ? 'show' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-title"
          >
            {fbView === 'menu' ? (
              <>
                <div className="fb-head">
                  <h2 id="fb-title">Send feedback to Google</h2>
                  <button type="button" className="fb-close" aria-label="Close" onClick={closeFeedback}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <div className="fb-hero">
                  <img className="fb-hero-art" src="/feedback-hero.jpg" alt="" draggable="false" />
                </div>
                <div className="fb-list" role="menu">
                  <button type="button" className="fb-item" role="menuitem" onClick={openIssueForm}>
                    <span className="fb-item-icon" aria-hidden="true"><FeedbackFlagIcon /></span>
                    Report an issue
                  </button>
                  <button type="button" className="fb-item" role="menuitem" onClick={openIdeaForm}>
                    <span className="fb-item-icon" aria-hidden="true"><FeedbackIdeaIcon /></span>
                    Suggest an idea
                  </button>
                </div>
              </>
            ) : fbView === 'issue' ? (
              <>
                <div className="fb-head fb-head-form">
                  <button type="button" className="fb-back" aria-label="Back" onClick={backToFeedbackMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <h2 id="fb-title">Report an issue</h2>
                  <button type="button" className="fb-close" aria-label="Close" onClick={closeFeedback}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="ri-body">
                  <label className="ri-label" htmlFor="ri-trying">
                    When you noticed this issue, what were you trying to do? <span className="ri-req">(required)</span>
                  </label>
                  <div className={`ri-select ${issueTryingOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      id="ri-trying"
                      className={`ri-select-btn ${issueTrying ? 'has' : ''}`}
                      aria-haspopup="listbox"
                      aria-expanded={issueTryingOpen}
                      onClick={() => setIssueTryingOpen((v) => !v)}
                    >
                      <span>{issueTrying || 'Choose an option'}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                    {issueTryingOpen && (
                      <ul className="ri-select-menu" role="listbox">
                        {ISSUE_TRYING_OPTS.map((opt) => (
                          <li key={opt} role="option" aria-selected={issueTrying === opt}>
                            <button
                              type="button"
                              onClick={() => { setIssueTrying(opt); setIssueTryingOpen(false); }}
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <label className="ri-label" htmlFor="ri-desc">
                    Describe your issue <span className="ri-req">(required)</span>
                  </label>
                  <textarea
                    id="ri-desc"
                    className="ri-textarea"
                    rows={5}
                    placeholder="Tell us what happened and what's not working"
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                  />
                  <p className="ri-sensitive">
                    Please don&apos;t include any sensitive information
                    <button type="button" className="ri-help" aria-label="More information" title="Don't include passwords, personal data, or confidential content">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                      </svg>
                    </button>
                  </p>

                  <p className="ri-shot-hint">A screenshot will help us better understand the issue.</p>
                  <button type="button" className="ri-capture">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                    </svg>
                    Capture screenshot
                  </button>

                  <label className="ri-check">
                    <input
                      type="checkbox"
                      checked={issueOptIn}
                      onChange={(e) => setIssueOptIn(e.target.checked)}
                    />
                    <span className="ri-check-box" aria-hidden="true" />
                    <span>Opt in for updates and information requests</span>
                  </label>

                  <p className="ri-legal">
                    Some <a href="https://support.google.com/accounts/answer/162743" target="_blank" rel="noreferrer">account and system information</a> may be sent to Google. We use it to fix problems and improve our services, subject to our <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>. Visit <a href="https://support.google.com/legal/troubleshooter/1114905" target="_blank" rel="noreferrer">Legal Help</a> to ask for content changes for legal reasons.
                  </p>
                </div>

                <div className="ri-foot">
                  <button type="button" className="ri-send" disabled={!issueCanSend}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="fb-head fb-head-form">
                  <button type="button" className="fb-back" aria-label="Back" onClick={backToFeedbackMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <h2 id="fb-title">Suggest an idea</h2>
                  <button type="button" className="fb-close" aria-label="Close" onClick={closeFeedback}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="ri-body">
                  <label className="ri-label" htmlFor="idea-desc">
                    Describe your idea or suggestion <span className="ri-req">(required)</span>
                  </label>
                  <textarea
                    id="idea-desc"
                    className="ri-textarea"
                    rows={6}
                    placeholder="Tell us what you'd like to see"
                    value={ideaDesc}
                    onChange={(e) => setIdeaDesc(e.target.value)}
                  />
                  <p className="ri-sensitive">
                    Please don&apos;t include any sensitive information
                    <button type="button" className="ri-help" aria-label="More information" title="Don't include passwords, personal data, or confidential content">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                      </svg>
                    </button>
                  </p>

                  <p className="ri-shot-hint">A screenshot will help us better understand your idea.</p>
                  <button type="button" className="ri-capture">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                    </svg>
                    Capture screenshot
                  </button>

                  <label className="ri-check">
                    <input
                      type="checkbox"
                      checked={ideaOptIn}
                      onChange={(e) => setIdeaOptIn(e.target.checked)}
                    />
                    <span className="ri-check-box" aria-hidden="true" />
                    <span>Opt in for updates and information requests</span>
                  </label>

                  <p className="ri-legal">
                    Some <a href="https://support.google.com/accounts/answer/162743" target="_blank" rel="noreferrer">account and system information</a> may be sent to Google. We use it to fix problems and improve our services, subject to our <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>. Visit <a href="https://support.google.com/legal/troubleshooter/1114905" target="_blank" rel="noreferrer">Legal Help</a> to ask for content changes for legal reasons.
                  </p>
                </div>

                <div className="ri-foot">
                  <button type="button" className="ri-send" disabled={!ideaCanSend}>
                    Send
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}

      <SettingsModal
        mounted={stMounted}
        shown={stShown}
        onClose={closeSettings}
        devices={devices}
        mediaAllowed={mediaRequested}
        sel={sel}
        onSelectDevice={(key, id) => setSel((s) => ({ ...s, [key]: id }))}
        camFound={devices.cams.length > 0}
        onTestSpeakers={() => playSpeakerTest(sel.speaker)}
        pushToTalk={pushToTalk}
        onPushToTalkChange={(enabled) => { setPushToTalk(enabled); if (enabled) setMicOn(false); }}
        onSendResolutionChange={applySendResolution}
      />

      {tsMounted && (
        <>
          <div className={`ts-scrim ${tsShown ? 'show' : ''}`} onMouseDown={closeTroubleshooting} aria-hidden="true" />
          <div className={`ts-shell ${tsShown ? 'show' : ''}`}>
            <aside
              className="ts-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ts-title"
            >
              <nav className="ts-nav" aria-label="Troubleshooting sections">
                <h2 id="ts-title">Troubleshooting &amp; help</h2>
                <button
                  type="button"
                  className={`ts-nav-item ${tsTab === 'troubleshoot' ? 'active' : ''}`}
                  aria-current={tsTab === 'troubleshoot' ? 'page' : undefined}
                  onClick={() => setTsTab('troubleshoot')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12h3l2-5 3 10 2-5h6" />
                  </svg>
                  Troubleshooting
                </button>
                <button
                  type="button"
                  className={`ts-nav-item ${tsTab === 'help' ? 'active' : ''}`}
                  aria-current={tsTab === 'help' ? 'page' : undefined}
                  onClick={() => setTsTab('help')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                  </svg>
                  Help
                </button>
              </nav>

              <div className="ts-main">
                <div className="ts-main-bar">
                  <button type="button" className="fb-close" aria-label="Close" onClick={closeTroubleshooting}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="ts-pages">
                  <div className={`ts-page ${tsTab === 'troubleshoot' ? 'show' : ''}`} aria-hidden={tsTab !== 'troubleshoot'}>
                    <div className="ts-body">
                      <section className="ts-section">
                        <div className="ts-section-head">
                          <span className="ts-section-icon" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z" />
                            </svg>
                          </span>
                          <h3>System load</h3>
                        </div>
                        <ul className="ts-tips">
                          <li>
                            <span className="ts-tip-ico" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z" /></svg>
                            </span>
                            Plug in your charger
                          </li>
                          <li>
                            <span className="ts-tip-ico" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V8h14v10z" /></svg>
                            </span>
                            Close browser tabs you don&apos;t need
                          </li>
                          <li>
                            <span className="ts-tip-ico" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" /></svg>
                            </span>
                            Close other apps running on your computer
                          </li>
                        </ul>
                      </section>

                      <section className="ts-section ts-cpu">
                        <div className="ts-cpu-label">
                          <span>CPU USAGE</span>
                          <p>Very high values may reduce call quality
                            <button type="button" className="ri-help" aria-label="More information" title="High CPU load can cause video blur, audio glitches, or delayed reactions">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                              </svg>
                            </button>
                          </p>
                        </div>
                        <CpuUsageChart active={tsShown && tsTab === 'troubleshoot'} />
                      </section>

                      <div className="ts-helpful">
                        <span>Is this helpful?</span>
                        <div className="ts-thumbs">
                          <button
                            type="button"
                            className={`ts-thumb ${tsHelpful === 'up' ? 'on' : ''}`}
                            aria-label="Yes"
                            aria-pressed={tsHelpful === 'up'}
                            onClick={() => setTsHelpful('up')}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`ts-thumb ${tsHelpful === 'down' ? 'on' : ''}`}
                            aria-label="No"
                            aria-pressed={tsHelpful === 'down'}
                            onClick={() => setTsHelpful('down')}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <section className="ts-section ts-av">
                        <div className="ts-section-head">
                          <span className="ts-section-icon" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z" />
                            </svg>
                          </span>
                          <div>
                            <h3>Audio &amp; video devices</h3>
                            <p className="ts-av-sub">No echo detected</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className={`ts-page ${tsTab === 'help' ? 'show' : ''}`} aria-hidden={tsTab !== 'help'}>
                    <div className="ts-help">
                      <label className="ts-search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                          type="search"
                          placeholder="Search Help Center"
                          value={tsSearch}
                          onChange={(e) => setTsSearch(e.target.value)}
                          aria-label="Search Help Center"
                        />
                      </label>

                      <p className="ts-help-cat">HOW TO USE MEET</p>
                      <ul className="ts-help-list">
                        <li>
                          <a href="https://support.google.com/meet/answer/9308979" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Present during a video meeting
                          </a>
                        </li>
                        <li>
                          <a href="https://support.google.com/meet/answer/9308681" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Record a video meeting
                          </a>
                        </li>
                        <li>
                          <a href="https://support.google.com/meet/answer/9304354" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Live stream a video meeting
                          </a>
                        </li>
                        <li>
                          <a href="https://support.google.com/meet/answer/10058482" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Change your background
                          </a>
                        </li>
                      </ul>

                      <p className="ts-help-cat">TROUBLESHOOT ISSUES WITH MEET</p>
                      <ul className="ts-help-list">
                        <li>
                          <a href="https://support.google.com/meet/answer/11231128" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Present your screen &amp; camera issues
                          </a>
                        </li>
                        <li>
                          <a href="https://support.google.com/meet/answer/9092963" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Video and audio quality
                          </a>
                        </li>
                        <li>
                          <a href="https://support.google.com/meet/answer/7317473" target="_blank" rel="noreferrer">
                            <span className="ts-doc" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                            </span>
                            Requirements for using Meet
                          </a>
                        </li>
                      </ul>

                      <a className="ts-help-more" href="https://support.google.com/meet" target="_blank" rel="noreferrer">
                        See all help articles
                      </a>
                      <div className="ts-help-rule" />
                      <a className="ts-help-more" href="https://support.google.com/meet/community" target="_blank" rel="noreferrer">
                        Community
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
