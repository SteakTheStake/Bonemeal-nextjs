import React, { useCallback, useRef } from "react";

type Particle = {
  id: number;
  el: SVGSVGElement;
  timeout: number;
};

const COLORS = ["#13F529", "#16F229", "#16C529"];
const SHAPES = [
  // star
  `<polygon class="star" points="21,0,28.053423027509677,11.29179606750063,40.97218684219823,14.510643118126104,32.412678195541844,24.70820393249937,33.34349029814194,37.989356881873896,21,33,8.656509701858067,37.989356881873896,9.587321804458158,24.70820393249937,1.0278131578017735,14.510643118126108,13.94657697249032,11.291796067500632"></polygon>`,
  // other-star
  `<polygon class="other-star" points="18,0,22.242640687119284,13.757359312880714,36,18,22.242640687119284,22.242640687119284,18.000000000000004,36,13.757359312880716,22.242640687119284,0,18.000000000000004,13.757359312880714,13.757359312880716"></polygon>`,
  // diamond
  `<polygon class="diamond" points="18,0,27.192388155425117,8.80761184457488,36,18,27.19238815542512,27.192388155425117,18.000000000000004,36,8.807611844574883,27.19238815542512,0,18.000000000000004,8.80761184457488,8.807611844574884"></polygon>`
];

export default function GrowButtonParticles() {
  const particlesRef = useRef<HTMLDivElement>(null);

  const spawnParticles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const container = particlesRef.current;
    if (!container) return;

    // Get click position relative to particles container
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const group: Particle[] = [];
    const num = Math.floor(Math.random() * 50) + 30;

    for (let i = 0; i < num; i++) {
      const randBG = Math.floor(Math.random() * COLORS.length);
      const getShape = Math.floor(Math.random() * SHAPES.length);
      const scale = Math.floor(Math.random() * (8 - 4 + 1)) + 4; // 4..8
      const x = Math.floor(Math.random() * (150 + 100)) - 100;   // -100..150
      const y = Math.floor(Math.random() * (150 + 100)) - 100;   // -100..150
      const dur = Math.floor(Math.random() * 1700) + 1000;       // 1000..2700ms

      // Create SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "shape");
      svg.setAttribute("viewBox", "0 0 40 40");
      svg.style.position = "absolute";
      svg.style.width = "50px";
      svg.style.height = "50px";
      svg.style.transform = `scale(${0.1 * scale})`;
      svg.style.transition = `${dur}ms`;
      svg.style.fill = COLORS[randBG];
      svg.style.top = `${clickY + 20}px`;  // baseline to mimic original offsets
      svg.style.left = `${clickX + 40}px`;

      // Insert shape path/polygon
      svg.innerHTML = SHAPES[getShape];

      // Append to container
      container.appendChild(svg);

      // Defer to allow transition to apply, then move outwards & scale to 0
      requestAnimationFrame(() => {
        svg.style.left = `${clickX + x + 50}px`;
        svg.style.top = `${clickY + y + 15}px`;
        svg.style.transform = `scale(0)`;
      });

      // Cleanup
      const timeout = window.setTimeout(() => {
        svg.remove();
      }, 2000);

      group.push({ id: i, el: svg, timeout });
    }

    // Safety cleanup on unmount (handled implicitly here since we remove after 2s)
  }, []);

  return (
    <div className="btn-contain">
      <button className="btn" onClick={spawnParticles}>
        Grow
      </button>
      <div className="btn-particles" ref={particlesRef} />
      <style dangerouslySetInnerHTML={{ __html: `
        .shape {
          position: absolute;
          width: 50px;
          height: 50px;
          transform: scale(0.8);
        }
        .cir {
          position: absolute;
          border-radius: 50%;
          z-index: 5;
        }
        .btn-contain {
          width: 200px;
          height: 100px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 4px;
          background: #333;
          text-align: center;
          z-index: 10;
          transition: 0.2s;
          cursor: pointer;
          color: #fff;
          padding: 10px 20px;
          box-shadow: 0px 1px 5px 2px #bfceef;
          border: none;
          font-weight: 600;
        }
        .btn:active,
        .btn:hover,
        .btn:focus {
          outline: none !important;
          color: #fff;
        }
        .btn:active {
          transform: scale(0.9) translate(-55%, -55%);
        }
        .btn-particles {
          width: 100px;
          height: 100px;
          position: absolute;
          border-radius: 50%;
          color: #eee;
          font-family: monospace;
          z-index: 5;
          /* filter: url(#gooeyness); */
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          pointer-events: none; /* lets clicks go to button */
        }
      `}</style>
    </div>
  );
}
