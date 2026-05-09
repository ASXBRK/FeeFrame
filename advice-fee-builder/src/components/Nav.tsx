import { useState, useEffect } from 'react';
import ffFavicon from '../assets/logos/ff-favicon-teal.svg';

type NavPage = 'landing' | 'about' | 'contact';
type AnyPage = NavPage | 'feecompare' | 'feequote' | 'feereview';

export default function Nav({ current, onNavigate }: { current: NavPage; onNavigate: (p: AnyPage) => void }) {
  const [shadow, setShadow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShadow(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = (page: AnyPage, label: string) => {
    const active = current === page;
    return (
      <button
        onClick={() => onNavigate(page)}
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '15px',
          color: active ? '#0d9488' : '#374151',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          letterSpacing: '0.01em',
        }}
      >
        [ {label}&nbsp;&nbsp;&nbsp;]
      </button>
    );
  };

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 48px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'box-shadow 0.2s ease',
      boxShadow: shadow ? '0 1px 16px rgba(0,0,0,0.08)' : 'none',
    }}>
      <button onClick={() => onNavigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <img src={ffFavicon} alt="FeeFrame" style={{ height: '36px', width: 'auto', display: 'block' }} />
      </button>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {link('landing', 'Home')}
        {link('about', 'About')}
        {link('feecompare', 'FeeCompare')}
        {link('feequote', 'FeeQuote')}
        {link('feereview', 'FeeReview')}
        {link('contact', 'Contact')}
      </div>
    </nav>
  );
}
