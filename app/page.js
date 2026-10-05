'use client';
import { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

// Each piece is a clipped region of the real photo that flies apart on scroll.
// x/y are in % of the scene size.
const PARTS = [
  { id: 'floor', title: 'Rubber Floor Mat', clip: 'polygon(6% 69%,36% 66%,90% 66%,96% 80%,70% 99%,24% 99%,5% 80%)', x: 0, y: 17, r: 0, z: 1,
    text: 'The foundation. A thick, dense rubber floor protects your subfloor, absorbs drops and keeps every lift quiet and stable.', spec: ['Shock absorbing', 'Anti-slip', 'Interlocking tiles'] },
  { id: 'rack', title: 'Power Rack & Cable Station', clip: 'polygon(30% 15%,62.5% 15%,62.5% 60%,41% 60%,41% 76%,30% 76%)', x: 2, y: -15, r: 0, z: 2,
    text: 'The heart of the system. A steel power cage with Smith bar, dual pulley towers, pull-up handles and numbered uprights for safe, precise squats and presses.', spec: ['11-gauge steel', 'Dual cable', 'Smith + free bar', 'Safety catches'] },
  { id: 'plates', title: 'Bumper Plates', clip: 'polygon(25.5% 34%,33.5% 34%,33.5% 68%,25.5% 68%)', x: -24, y: -8, r: -5, z: 3,
    text: 'Stored on the integrated plate horns. Rubber-coated bumper plates are built to be dropped, with low bounce and minimal noise.', spec: ['Rubber bumper', 'Low bounce', 'Color-free black'] },
  { id: 'bench', title: 'Adjustable Bench', clip: 'polygon(41% 60%,70% 60%,70% 75%,41% 75%)', x: 5, y: 13, r: 3, z: 4,
    text: 'A flat-to-incline utility bench with a stable wide base and dense padding. One piece for presses, rows, step-ups and more.', spec: ['Multi-angle', 'Dense padding', 'Wide base'] },
  { id: 'bike', title: 'Spin Bike', clip: 'polygon(10% 41%,29.5% 41%,29.5% 80%,10% 80%)', x: -27, y: 10, r: -4, z: 5,
    text: 'Cardio without leaving the room. A weighted flywheel gives a smooth, road-like ride with adjustable seat, handlebars and resistance.', spec: ['Weighted flywheel', 'Adjustable fit', 'Quiet drive'] },
  { id: 'pad', title: 'Folding Mat', clip: 'polygon(72% 56.5%,85% 56.5%,85% 73%,72% 73%)', x: 24, y: -13, r: 5, z: 4,
    text: 'A thick tri-fold mat for core, stretching and mobility work. Folds flat and stores in seconds.', spec: ['Tri-fold', 'Carry handle', 'Easy storage'] },
  { id: 'db', title: 'Adjustable Dumbbells', clip: 'polygon(59.5% 70%,87.5% 70%,87.5% 86.5%,59.5% 86.5%)', x: 20, y: 22, r: -3, z: 6,
    text: 'A whole dumbbell rack in two handles. Dial your weight in a second and switch between exercises without changing equipment.', spec: ['Quick-select', 'Compact', 'Knurled grip'] },
];
const N = PARTS.length;

function Piece({ p, prog, active }) {
  const ex = useTransform(prog, [0.04, 0.2], [0, 1]);
  const s = useSpring(ex, { stiffness: 90, damping: 22, mass: 0.6 });
  const x = useTransform(s, (v) => `${p.x * v}%`);
  const y = useTransform(s, (v) => `${p.y * v}%`);
  const rot = useTransform(s, (v) => p.r * v);
  const sc = useTransform(s, (v) => 1 + 0.0 * v);
  return (
    <motion.div className="piece" style={{ clipPath: p.clip, WebkitClipPath: p.clip, x, y, rotate: rot, scale: sc, zIndex: p.z }}
      animate={{ opacity: active === -1 || active === PARTS.indexOf(p) ? 1 : 0.18, filter: active === PARTS.indexOf(p) ? 'brightness(1.25) drop-shadow(0 0 40px rgba(255,90,31,.45))' : 'brightness(1) drop-shadow(0 30px 40px rgba(0,0,0,.55))' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
  );
}

export default function Page() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const prog = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.5 });
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < 0.22) return setActive(-1);
    const i = Math.min(N - 1, Math.floor(((v - 0.22) / 0.78) * N));
    setActive(i);
  });
  const sceneScale = useTransform(prog, [0, 0.2, 1], [1.08, 0.82, 0.82]);
  const sceneRot = useTransform(prog, [0, 0.2], [0, -2]);
  const gridY = useTransform(prog, [0, 1], ['0%', '-12%']);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const part = PARTS[active];

  return (
    <main>
      <section className="hero">
        <div>
          <div className="eyebrow">Complete Home Gym</div>
          <h1>IRONFRAME</h1>
          <p>Everything you need to train, in one footprint. Scroll to take it apart, piece by piece.</p>
        </div>
        <div className="cue" />
      </section>

      <section className="track" ref={ref}>
        <div className="stage">
          <motion.div className="bar" style={{ scaleX: bar }} />
          <div className="glow" />
          <motion.div className="grid" style={{ y: gridY }} />
          <motion.div className="scene" style={{ scale: sceneScale, rotate: sceneRot }}>
            {PARTS.map((p) => (<Piece key={p.id} p={p} prog={prog} active={active} />))}
          </motion.div>
          <div className="rail">{PARTS.map((p, i) => <div key={p.id} className={'dot' + (i === active ? ' on' : '')} />)}</div>
          <div className="panel">
            <AnimatePresence mode="wait">
              {active === -1 ? (
                <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}>
                  <div className="num">EXPLODED VIEW</div>
                  <h2>Seven pieces. One system.</h2>
                  <p>Keep scrolling and watch each part separate.</p>
                </motion.div>
              ) : (
                <motion.div key={part.id} initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="num">0{active + 1} / 0{N}</div>
                  <h2>{part.title}</h2>
                  <p>{part.text}</p>
                  <div className="spec">{part.spec.map((s) => <span key={s}>{s}</span>)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="outro">
        <div>
          <h2>Build your<br />home gym.</h2>
          <a href="#">Get in touch</a>
        </div>
      </section>
    </main>
  );
}
