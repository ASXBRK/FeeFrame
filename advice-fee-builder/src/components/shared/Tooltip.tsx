import { useState } from 'react';

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
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children ?? <InfoIcon />}
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-input bg-dark text-white text-xs px-3 py-2 leading-relaxed pointer-events-none shadow-lg"
          style={{ whiteSpace: 'normal' }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-dark" />
        </span>
      )}
    </span>
  );
}
