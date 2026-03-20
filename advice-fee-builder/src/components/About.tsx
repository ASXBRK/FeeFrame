import feeframeLogo from '../assets/logos/feeframe-light.svg';

export default function About() {
  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero */}
      <section style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '96px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>
        <img src={feeframeLogo} alt="FeeFrame" style={{ height: '56px', width: 'auto', marginBottom: '48px' }} />
        <h1 style={{
          fontWeight: 800,
          fontSize: 'clamp(40px, 7vw, 80px)',
          color: '#111827',
          letterSpacing: '-2px',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          About<br /><span style={{ color: '#0d9488' }}>FeeFrame.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '520px', lineHeight: 1.6 }}>
          This page is coming soon.
        </p>
      </section>

      {/* Placeholder content */}
      <section style={{ padding: '96px 48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '640px', width: '100%' }}>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '52px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '28px', color: '#0d9488', letterSpacing: '-0.5px' }}>
              [ FeeFrame   ]
            </span>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, marginTop: '24px' }}>
              FeeFrame is a free, browser-based fee calculator built for Australian financial advisers and paraplanners. No login required. No data stored.
            </p>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, marginTop: '16px' }}>
              More about the story behind FeeFrame is coming soon.
            </p>
            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', color: '#9ca3af', textTransform: 'uppercase' }}>
                Built for Australian advice practices · Free to use · No data stored
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: 'auto' }}>
        <span style={{ fontWeight: 700, fontSize: '20px', color: '#0d9488', letterSpacing: '-0.5px' }}>[ FeeFrame ]</span>
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Built for Australian advice practices · Free to use · No data stored</p>
      </footer>

    </div>
  );
}
