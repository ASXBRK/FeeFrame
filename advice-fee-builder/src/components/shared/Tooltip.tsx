import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

function InfoIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      className="text-mid cursor-default flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" />
      <path d="M8 7.5v4" />
      <circle cx="8" cy="4.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Tooltip({ text, children }: { text: string; children?: React.ReactNode }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function handleMouseEnter() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top, left: r.left + r.width / 2 });
    }
  }

  return (
    <span
      ref={ref}
      className="inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setPos(null)}
    >
      {children ?? <InfoIcon />}
      {pos && createPortal(
        <span
          className="fixed z-[9999] w-64 rounded-input bg-dark text-white text-xs px-3 py-2 leading-relaxed pointer-events-none shadow-lg"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, calc(-100% - 8px))', whiteSpace: 'normal' }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-dark" />
        </span>,
        document.body,
      )}
    </span>
  );
}
