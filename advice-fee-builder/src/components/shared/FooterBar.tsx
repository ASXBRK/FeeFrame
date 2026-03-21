import feeframeLogo from '../../assets/logos/feeframe-primary-light.svg';

type FooterPage = 'home' | 'about' | 'feequote' | 'feeanalysis' | 'contact';

const NAV_LINKS: { id: FooterPage; label: string }[] = [
  { id: 'home',        label: 'Home' },
  { id: 'about',       label: 'About' },
  { id: 'feequote',    label: 'FeeQuote' },
  { id: 'feeanalysis', label: 'FeeAnalysis' },
  { id: 'contact',     label: 'Contact' },
];

export default function FooterBar({ currentPage, onNavigate }: { currentPage: FooterPage; onNavigate: (page: FooterPage) => void }) {
  const links = NAV_LINKS.filter(link => link.id !== currentPage);

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-5 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: FeeFrame logo */}
        <div className="flex-shrink-0">
          <img src={feeframeLogo} alt="FeeFrame" className="h-6" />
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
    </div>
  );
}
