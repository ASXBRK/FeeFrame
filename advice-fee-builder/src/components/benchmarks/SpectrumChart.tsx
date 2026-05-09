import { useEffect, useRef, useState } from 'react';
import type { AnchorSet } from '../../lib/benchmarks/types';

interface Props {
  anchors: AnchorSet;
  userFee: number;
  costJustifiedFee: number | null;
}

const SVG_H = 140;
const PAD_L = 16;
const PAD_R = 16;
const BAR_Y = 65;
const BAR_H = 34;
const BAR_Y1 = BAR_Y + BAR_H; // 99

function fmtFee(v: number): string {
  if (v >= 100_000) return '$' + Math.round(v / 1_000) + 'K';
  if (v >= 10_000)  return '$' + (v / 1_000).toFixed(0) + 'K';
  return '$' + Math.round(v).toLocaleString('en-AU');
}

function anchor(v: number, containerW: number, axMin: number, axMax: number): number {
  const chartW = containerW - PAD_L - PAD_R;
  return PAD_L + ((Math.max(axMin, Math.min(axMax, v)) - axMin) / (axMax - axMin)) * chartW;
}

function textAnchor(x: number, containerW: number): 'start' | 'middle' | 'end' {
  if (x < containerW * 0.15) return 'start';
  if (x > containerW * 0.85) return 'end';
  return 'middle';
}

export default function SpectrumChart({ anchors, userFee, costJustifiedFee }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { floor, median, topTwentyPct, xAxisMin, xAxisMax } = anchors;
  const chartW = width - PAD_L - PAD_R;
  const barEnd = PAD_L + chartW;

  const xf  = anchor(floor,        width, xAxisMin, xAxisMax);
  const xm  = anchor(median,       width, xAxisMin, xAxisMax);
  const xt  = anchor(topTwentyPct, width, xAxisMin, xAxisMax);

  const userInRange  = userFee >= xAxisMin && userFee <= xAxisMax;
  const userOffLeft  = userFee < xAxisMin;
  const userOffRight = userFee > xAxisMax;
  const xu = userInRange ? anchor(userFee, width, xAxisMin, xAxisMax) : (userOffLeft ? PAD_L : barEnd);

  const cjInRange = costJustifiedFee !== null && costJustifiedFee >= xAxisMin && costJustifiedFee <= xAxisMax;
  const xc = cjInRange && costJustifiedFee !== null ? anchor(costJustifiedFee, width, xAxisMin, xAxisMax) : null;

  const pins = [
    { x: xf,  label: fmtFee(floor),        zone: 'Floor',     main: false },
    { x: xm,  label: fmtFee(median),       zone: 'Median',    main: true  },
    { x: xt,  label: fmtFee(topTwentyPct), zone: 'Top 20%',   main: true  },
  ];

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={width}
        height={SVG_H}
        role="img"
        aria-label={`Fee spectrum: your fee ${fmtFee(userFee)}, market median ${fmtFee(median)}, top 20% ${fmtFee(topTwentyPct)}`}
      >
        {/* Zone fills */}
        <rect x={PAD_L} y={BAR_Y} width={xm - PAD_L}    height={BAR_H} fill="#f0fdfa" rx="3"/>
        <rect x={xm}    y={BAR_Y} width={xt - xm}        height={BAR_H} fill="#ccfbf1"/>
        <rect x={xt}    y={BAR_Y} width={barEnd - xt}    height={BAR_H} fill="#99f6e4" rx="3"/>
        <rect x={PAD_L} y={BAR_Y} width={chartW}          height={BAR_H} fill="none" stroke="#d1d5db" strokeWidth="1" rx="3"/>

        {/* Zone dividers */}
        <line x1={xm} y1={BAR_Y} x2={xm} y2={BAR_Y1} stroke="#0d9488" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3,3"/>
        <line x1={xt} y1={BAR_Y} x2={xt} y2={BAR_Y1} stroke="#0d9488" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3,3"/>

        {/* Anchor pins */}
        {pins.map(({ x, label, zone, main }) => (
          <g key={zone}>
            <line x1={x} y1={27} x2={x} y2={BAR_Y} stroke={main ? '#0d9488' : '#64748b'} strokeWidth={main ? 2 : 1.5}/>
            <text x={x} y={22} textAnchor={textAnchor(x, width)} fontSize="10" fontWeight={main ? '600' : 'normal'} fill={main ? '#0d9488' : '#64748b'}>{label}</text>
            <text x={x} y={11} textAnchor={textAnchor(x, width)} fontSize="9" fill="#64748b">{zone}</text>
          </g>
        ))}

        {/* Cost-justified diamond ABOVE bar */}
        {xc !== null && costJustifiedFee !== null && (
          <g>
            <line x1={xc} y1={27} x2={xc} y2={BAR_Y} stroke="#374151" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2,3"/>
            <polygon points={`${xc},${BAR_Y} ${xc - 9},${BAR_Y - 14} ${xc},${BAR_Y - 28} ${xc + 9},${BAR_Y - 14}`} fill="white" stroke="#374151" strokeWidth="2"/>
            <text x={xc} y={29} textAnchor={textAnchor(xc, width)} fontSize="10" fontWeight="600" fill="#374151">{fmtFee(costJustifiedFee)}</text>
            <text x={xc} y={19} textAnchor={textAnchor(xc, width)} fontSize="9" fill="#64748b">Cost-justified</text>
          </g>
        )}

        {/* User fee marker BELOW bar */}
        {userInRange && (
          <g>
            <polygon points={`${xu},${BAR_Y1} ${xu - 9},${BAR_Y1 + 16} ${xu + 9},${BAR_Y1 + 16}`} fill="#0d9488"/>
            <text x={xu} y={BAR_Y1 + 30} textAnchor={textAnchor(xu, width)} fontSize="11" fontWeight="700" fill="#0d9488">{fmtFee(userFee)}</text>
          </g>
        )}

        {/* Off-chart arrows */}
        {userOffLeft && (
          <g>
            <polygon points={`${PAD_L},${BAR_Y + 17} ${PAD_L + 12},${BAR_Y + 9} ${PAD_L + 12},${BAR_Y + 25}`} fill="#f59e0b"/>
            <text x={PAD_L + 16} y={BAR_Y + 21} fontSize="10" fill="#d97706" fontWeight="600">{fmtFee(userFee)} — below chart range</text>
          </g>
        )}
        {userOffRight && (
          <g>
            <polygon points={`${barEnd},${BAR_Y + 17} ${barEnd - 12},${BAR_Y + 9} ${barEnd - 12},${BAR_Y + 25}`} fill="#f59e0b"/>
            <text x={barEnd - 16} y={BAR_Y + 21} fontSize="10" fill="#d97706" fontWeight="600" textAnchor="end">{fmtFee(userFee)} — above chart range</text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 px-0.5">
        <div className="flex items-center gap-1.5 text-xs text-dark">
          <svg width="14" height="12" viewBox="0 0 14 12">
            <polygon points="7,0 0,12 14,12" fill="#0d9488"/>
          </svg>
          Your fee
        </div>
        {costJustifiedFee !== null && (
          <div className="flex items-center gap-1.5 text-xs text-dark">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon points="7,0 0,7 7,14 14,7" fill="white" stroke="#374151" strokeWidth="2"/>
            </svg>
            Cost-justified (practice profile)
          </div>
        )}
      </div>
    </div>
  );
}
