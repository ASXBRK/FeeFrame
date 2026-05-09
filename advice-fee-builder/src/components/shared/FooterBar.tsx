type FooterPage = 'home' | 'feecompare' | 'feequote' | 'feereview' | 'about' | 'contact' | 'privacy' | 'terms';

const NAV_LINKS: { id: FooterPage; label: string }[] = [
  { id: 'home',       label: 'Home' },
  { id: 'feecompare', label: 'FeeCompare' },
  { id: 'feequote',   label: 'FeeQuote' },
  { id: 'feereview',  label: 'FeeReview' },
  { id: 'about',      label: 'About' },
  { id: 'contact',    label: 'Contact' },
];

function FeeFrameLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" className={className} aria-label="FeeFrame">
      <path d="M22 14 L8 14 L8 66 L22 66" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
      <path d="M298 14 L312 14 L312 66 L298 66" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
      <text style={{ fontFamily: "'DM Sans', Georgia, serif", fontSize: 36, fontWeight: 600, letterSpacing: '-0.8px', fill: '#0d9488' }} x="34" y="57">FeeFrame</text>
    </svg>
  );
}

export default function FooterBar({ currentPage, onNavigate }: { currentPage: FooterPage; onNavigate: (page: FooterPage) => void }) {
  const links = NAV_LINKS.filter(link => link.id !== currentPage);

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-5 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: FeeFrame logo */}
        <div className="flex-shrink-0">
          <FeeFrameLogo className="h-6" />
        </div>

        {/* Center: Trust signals (hidden on mobile) */}
        <p className="text-sm text-gray-400 hidden sm:block text-center flex-1">
          Built for Australian advice practices · Free to use · No data stored
        </p>

        {/* Right: Bracket navigation links */}
        <div className="flex items-center gap-0.5">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 2px',
                letterSpacing: '0.01em',
                whiteSpace: 'pre',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >
              {'[ '}{link.label}{'   ]'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: trust signals below */}
      <p className="sm:hidden text-center text-xs text-gray-400 mt-3">
        Built for Australian advice practices · Free to use · No data stored
      </p>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-left">
          FeeFrame provides information only — not financial product advice. Use of FeeFrame does not create an adviser-client relationship. Always consult a licensed financial adviser for personal advice.
        </p>
        <p className="text-xs text-gray-400 mt-1.5 text-center sm:text-left">
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Privacy
          </button>
          {' · '}
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Terms
          </button>
          {' · '}
          <a
            href="mailto:[your-email@example.com]?subject=FeeFrame%20feedback&body=Hi%2C%0A%0AI%20have%20some%20feedback%20about%20FeeFrame%3A%0A%0A"
            className="hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Send feedback
          </a>
        </p>
      </div>
    </div>
  );
}
