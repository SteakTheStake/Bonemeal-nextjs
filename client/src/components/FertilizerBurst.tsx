"use client";
import { useEffect, useState } from "react";

type ShapeType = "star" | "diamond" | "square";
interface Shape {
  id: number;
  type: ShapeType;
  left: number;
  size: number;
  hue: number;
  delay: number;
  rise: number;
  drift: number;
  rot: number;
  dur: number;
}

export default function FertilizerBurst({ trigger }: { trigger?: boolean }) {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    let id = 0;
    // If trigger is true => micro burst, else big initial burst
    const count = trigger ? 9 : 22;
    const riseBase = trigger ? 60 : 140;

    const batch = Array.from({ length: count }).map(() => {
      id++;
      const dur = 2.6 + Math.random() * 0.8;
      return {
        id,
        type: (["star", "diamond", "square"] as ShapeType[])[
          Math.floor(Math.random() * 3)
        ],
        left: Math.random() * 100,
        size: 5 + Math.random() * 3,
        hue: 115 + Math.random() * 15,
        delay: Math.random() * 0.3,
        rise: riseBase + Math.random() * (trigger ? 40 : 80),
        drift: (Math.random() - 0.5) * 50,
        rot: (Math.random() - 0.5) * 90,
        dur,
      } as Shape;
    });
    setShapes(batch);

    const kill = setTimeout(() => setShapes([]), 4000);
    return () => clearTimeout(kill);
  }, [trigger]);

  return (
    <div className="fertilizer-burst-anchor">
      <div className="fertilizer-burst">
        {shapes.map((s) => (
          <span
            key={s.id}
            className="shape animate-burst-fall will-change-transform"
            style={
              {
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                color: `hsl(${s.hue}, 20%, 67%)`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
                ["--rise" as any]: `${s.rise}px`,
                ["--drift" as any]: `${s.drift}px`,
                ["--rot" as any]: `${s.rot}deg`,
              } as React.CSSProperties
            }
          >
            {s.type === "star" && (
              <svg viewBox="0 0 24 24" fill="currentColor" width={s.size} height={s.size}>
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
            )}
            {s.type === "diamond" && (
              <div
                style={{
                  width: s.size,
                  height: s.size,
                  background: "currentColor",
                  transform: "rotate(45deg)",
                }}
              />
            )}
            {s.type === "square" && (
              <div
                style={{
                  width: s.size,
                  height: s.size,
                  background: "currentColor",
                }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
