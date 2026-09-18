import { useEffect, useRef } from "react";

const WIDTH = 1000;
const HEIGHT = 580;

function createField() {
  return Array.from({ length: 9 }, (_, row) => {
    const radius = 208 + row * 21;
    const count = Math.round(radius / 10);
    return Array.from({ length: count }, (_, index) => {
      const theta = Math.PI * (1.075 + (index + (row % 2) * 0.45) / (count - 1) * 0.85);
      const seed = row * 73 + index * 19 + 1;
      const random = (offset) => {
        const value = Math.sin(seed * 127.1 + offset * 311.7) * 43758.5453;
        return value - Math.floor(value);
      };
      return {
        x: 500 + Math.cos(theta) * radius,
        y: 482 + Math.sin(theta) * radius,
        theta,
        radius,
        rest: theta + Math.PI / 2,
        angle: theta + Math.PI / 2,
        velocity: 0,
        starX: 24 + random(1) * 952,
        starY: 20 + random(2) * 540,
        weight: 0.55 + random(3) * 0.8,
        hue: 333 - row * 13,
      };
    });
  }).flat();
}

export function WhisperField({ pulse, reducedMotion, layout, quiet }) {
  const canvasRef = useRef(null);
  const pulseRef = useRef(() => {});
  const settingsRef = useRef({ thickness: 3.4, length: 14, size: 1, morph: layout === "stars" ? 1 : 0, quiet });

  useEffect(() => {
    settingsRef.current = { ...settingsRef.current, morph: layout === "stars" ? 1 : 0, quiet };
  }, [layout, quiet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;
    const field = createField();
    const rendered = { ...settingsRef.current };
    const cursor = { x: 500, y: 250, targetX: 500, targetY: 250, influence: 0, inside: false };
    let frame = 0;
    let previous = 0;
    let pulseStart = -Infinity;
    let bounds = canvas.getBoundingClientRect();

    const draw = (time) => {
      frame = 0;
      const dt = Math.min((time - previous) / 1000 || 1 / 60, 1 / 30);
      previous = time;
      const smoothing = 1 - Math.exp(-12 * dt);
      rendered.morph += ((settingsRef.current.morph ?? 0) - rendered.morph) * smoothing;
      cursor.x += (cursor.targetX - cursor.x) * smoothing;
      cursor.y += (cursor.targetY - cursor.y) * smoothing;
      const influence = cursor.inside && !settingsRef.current.quiet ? 1 : 0;
      cursor.influence += (influence - cursor.influence) * smoothing;
      const elapsed = (time - pulseStart) / 1000;
      let moving = Math.abs(cursor.influence - influence) > 0.001 || Math.abs(cursor.x - cursor.targetX) + Math.abs(cursor.y - cursor.targetY) > 0.1;
      moving ||= Math.abs(rendered.morph - settingsRef.current.morph) > 0.0001;
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.save();
      context.lineCap = "round";

      for (const dash of field) {
        const baseX = dash.x + (dash.starX - dash.x) * rendered.morph;
        const baseY = dash.y + (dash.starY - dash.y) * rendered.morph;
        const pointerX = cursor.x + (WIDTH / 2 - cursor.x) * (1 - rendered.morph);
        const pointerY = cursor.y + (HEIGHT / 2 - cursor.y) * (1 - rendered.morph);
        const desired = Math.atan2((pointerY - baseY) * bounds.height / HEIGHT, (pointerX - baseX) * bounds.width / WIDTH);
        const difference = Math.atan2(Math.sin(2 * (desired - dash.angle)), Math.cos(2 * (desired - dash.angle))) / 2;
        const restDifference = Math.atan2(Math.sin(2 * (dash.rest - dash.angle)), Math.cos(2 * (dash.rest - dash.angle))) / 2;
        const waveAge = elapsed - (dash.radius - 208) / 270;
        const wave = !reducedMotion && waveAge > 0 && waveAge < 1.15 ? Math.sin(waveAge / 1.15 * Math.PI) ** 2 : 0;
        const target = dash.angle + restDifference * (1 - cursor.influence) + difference * cursor.influence + wave * 0.035;
        if (reducedMotion) {
          dash.angle = dash.rest;
          dash.velocity = 0;
        } else {
          const steps = Math.ceil(dt / (1 / 120));
          const step = dt / steps;
          for (let index = 0; index < steps; index += 1) {
            dash.velocity += ((target - dash.angle) * 180 - dash.velocity * 25) * step;
            dash.angle += dash.velocity * step;
          }
        }
        moving ||= Math.abs(target - dash.angle) > 0.0003 || Math.abs(dash.velocity) > 0.002;
        const displacement = wave * 16 - (!reducedMotion && elapsed > 0 && elapsed < 0.45 ? Math.sin(elapsed / 0.45 * Math.PI) * 14 : 0);
        const fieldX = baseX + Math.cos(dash.theta) * displacement;
        const fieldY = baseY + Math.sin(dash.theta) * displacement;
        const x = ((fieldX - WIDTH / 2) * rendered.size + WIDTH / 2) * bounds.width / WIDTH;
        const y = ((fieldY - HEIGHT / 2) * rendered.size + HEIGHT / 2) * bounds.height / HEIGHT;
        const half = rendered.length * (1 + wave * 0.5) / 2;
        const stroke = rendered.thickness * (1 + (dash.weight - 1) * rendered.morph) + wave * 0.5;
        const textDistance = Math.hypot((x - bounds.width / 2) / Math.min(270, bounds.width * 0.42), (y - bounds.height * 0.4) / 155);
        const distance = Math.hypot((fieldX - 500) / 230, (fieldY - 290) / 155);
        const arcAlpha = 0.94 * (0.14 + Math.min(1, textDistance * textDistance) * 0.86);
        const starAlpha = (0.65 + dash.weight * 0.2) * (0.6 + Math.min(1, distance) * 0.4);
        context.globalAlpha = arcAlpha + (starAlpha - arcAlpha) * rendered.morph;
        context.strokeStyle = `hsl(${dash.hue} ${82 - rendered.morph * 16}% ${72 + rendered.morph * 5}%)`;
        context.lineWidth = stroke;
        context.beginPath();
        if (rendered.length === 0) {
          context.arc(x, y, stroke / 2, 0, Math.PI * 2);
          context.fillStyle = context.strokeStyle;
          context.fill();
        } else {
          context.moveTo(x - Math.cos(dash.angle) * half, y - Math.sin(dash.angle) * half);
          context.lineTo(x + Math.cos(dash.angle) * half, y + Math.sin(dash.angle) * half);
          context.stroke();
        }
      }
      context.restore();
      if (!reducedMotion && !document.hidden && (moving || elapsed < 2)) frame = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (!frame && !document.hidden) {
        previous = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    const resize = () => {
      bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      context.setTransform(canvas.width / bounds.width, 0, 0, canvas.height / bounds.height, 0, 0);
      wake();
    };
    const move = (event) => {
      if (reducedMotion || event.pointerType === "touch") return;
      bounds = canvas.getBoundingClientRect();
      cursor.targetX = (event.clientX - bounds.left) / bounds.width * WIDTH;
      cursor.targetY = (event.clientY - bounds.top) / bounds.height * HEIGHT;
      cursor.inside = true;
      wake();
    };
    const leave = () => { cursor.inside = false; wake(); };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    pulseRef.current = () => { pulseStart = performance.now(); wake(); };
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      pulseRef.current = () => {};
    };
  }, [reducedMotion]);

  useEffect(() => { if (pulse) pulseRef.current(); }, [pulse]);
  return <canvas ref={canvasRef} className="whisper-field" aria-hidden="true" />;
}
