/** Vertical pitch markings in a 680×1000 SVG coordinate space (attack = up). */
export const PITCH_W = 680;
export const PITCH_H = 1000;

export function PitchMarkings() {
  const line = { fill: "none", stroke: "var(--pitch-line)", strokeWidth: 3 } as const;
  return (
    <g>
      <rect x="0" y="0" width={PITCH_W} height={PITCH_H} fill="var(--pitch)" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x="0" y={i * 100} width={PITCH_W} height="50" fill="#ffffff" opacity="0.04" />
      ))}
      <rect x="30" y="30" width={PITCH_W - 60} height={PITCH_H - 60} {...line} />
      <line x1="30" y1={PITCH_H / 2} x2={PITCH_W - 30} y2={PITCH_H / 2} {...line} />
      <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="80" {...line} />
      <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="4" fill="var(--pitch-line)" />
      <rect x="150" y="30" width="380" height="150" {...line} />
      <rect x="250" y="30" width="180" height="55" {...line} />
      <rect x="150" y={PITCH_H - 180} width="380" height="150" {...line} />
      <rect x="250" y={PITCH_H - 85} width="180" height="55" {...line} />
      <path d={`M 270 180 A 80 80 0 0 0 410 180`} {...line} />
      <path d={`M 270 ${PITCH_H - 180} A 80 80 0 0 1 410 ${PITCH_H - 180}`} {...line} />
    </g>
  );
}

/** Convert a pointer event to pitch coordinates. */
export function toPitchPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const r = svg.getBoundingClientRect();
  return {
    x: Math.max(20, Math.min(PITCH_W - 20, ((clientX - r.left) / r.width) * PITCH_W)),
    y: Math.max(20, Math.min(PITCH_H - 20, ((clientY - r.top) / r.height) * PITCH_H)),
  };
}