'use client';

import { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

export default function RainAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dropsRef = useRef<RainDrop[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createDrops = () => {
      const drops: RainDrop[] = [];
      // density tuned to viewport area (adjust divisor to taste)
      const numDrops = Math.floor((window.innerWidth * window.innerHeight) / 2000);

      for (let i = 0; i < numDrops; i++) {
        drops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.random() * 10 + 6,          // 2–5 px/frame
          length: Math.random() * 8 + 5,       // 10–30 px
          opacity: Math.random() * 0.25 + 0.1     // 0.1–0.4
        });
      }
      dropsRef.current = drops;
    };

    const resizeCanvas = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      // set CSS size
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // set backing store size
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale all draws
      ctx.lineCap = 'round';
      ctx.lineWidth = 1;
      createDrops();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // draw each drop
      for (const drop of dropsRef.current) {
        drop.y += drop.speed;

        if (drop.y > window.innerHeight + drop.length) {
          drop.y = -drop.length;
          drop.x = Math.random() * window.innerWidth;
        }

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(115, 120, 255, ${drop.opacity})`; // blue
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ background: 'transparent', mixBlendMode: 'normal' }}
    />
  );
}
