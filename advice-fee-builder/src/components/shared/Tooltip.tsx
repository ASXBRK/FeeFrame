import { useState } from 'react';

export default function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
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
