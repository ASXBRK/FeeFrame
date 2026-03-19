import feeframeLightLogo from '../assets/logos/feeframe-primary-light.svg';
import feequoteLightLogo from '../assets/logos/feequote-light.svg';
import feeanalysisLightLogo from '../assets/logos/feeanalysis-light.svg';

export default function Landing({ onStartQuote, onStartAnalysis }: { onStartQuote: () => void; onStartAnalysis: () => void }) {
  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <img src={feeframeLightLogo} alt="FeeFrame" style={{ height: '36px' }} />
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#" style={{ fontSize: '15px', fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Home</a>
          <a href="#about" style={{ fontSize: '15px', fontWeight: 500, color: '#374151', textDecoration: 'none' }}>About</a>
        </div>
      </nav>
      {/* ── Hero ── */}
      <section style={{ background: '#fff', padding: '100px 48px 96px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '48px' }}>
          <img src={feeframeLightLogo} alt="FeeFrame" style={{ height: '80px' }} />
        </div>
        <h1 style={{ fontWeight: 700, fontSize: '44px', color: '#111827', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '20px', maxWidth: '640px' }}>
          Fee clarity for Australian advisers.
        </h1>
        <p style={{ fontSize: '20px', fontWeight: 400, color: '#6b7280', marginBottom: '48px', maxWidth: '480px', lineHeight: 1.5 }}>
          Know what to charge. Know if it's worth it.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onStartQuote}
            style={{ fontWeight: 600, fontSize: '17px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 36px', cursor: 'pointer', letterSpacing: '-0.2px' }}
          >
            Start FeeQuote →
          </button>
          <button
            onClick={onStartAnalysis}
            style={{ fontWeight: 600, fontSize: '17px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 36px', cursor: 'pointer', letterSpacing: '-0.2px' }}
          >
            Run FeeAnalysis →
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1px' }}>
          No login. No data stored. Just fees, [framed].
        </p>
      </section>
      {/* ── Tool Cards ── */}
      <section style={{ padding: '96px 48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px' }}>
          {/* FeeQuote */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '52px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '28px' }}>
              <img src={feequoteLightLogo} alt="FeeQuote" style={{ height: '56px' }} />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '28px', color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
              What should I charge?
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', color: '#6b7280', lineHeight: 1.65, marginBottom: '40px', flex: 1 }}>
              Scope a new client engagement and generate a fee you can actually justify.
            </p>
            <button
              onClick={onStartQuote}
              style={{ fontWeight: 600, fontSize: '16px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 24px', cursor: 'pointer', width: '100%' }}
            >
              Start quoting →
            </button>
          </div>
          {/* FeeAnalysis */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '52px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '28px' }}>
              <img src={feeanalysisLightLogo} alt="FeeAnalysis" style={{ height: '56px' }} />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '28px', color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
              Am I making money?
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', color: '#6b7280', lineHeight: 1.65, marginBottom: '40px', flex: 1 }}>
              Enter what you're charging. Find out if the client is actually profitable.
            </p>
            <button
              onClick={onStartAnalysis}
              style={{ fontWeight: 600, fontSize: '16px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 24px', cursor: 'pointer', width: '100%' }}
            >
              Analyse a client →
            </button>
          </div>
        </div>
      </section>
      {/* ── Video ── */}
      <section style={{ background: '#111827', padding: '96px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: '32px', color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '56px' }}>
          [ How it works ]
        </p>
        <div style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', cursor: 'pointer' }}>
          <div style={{ width: '72px', height: '72px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '24px solid #fff', marginLeft: '6px' }} />
          </div>
          <p style={{ fontSize: '15px', color: '#6b7280' }}>
            Video coming soon
          </p>
        </div>
      </section>
      {/* ── Footer ── */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <img src={feeframeLightLogo} alt="FeeFrame" style={{ height: '36px' }} />
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>
          Built for Australian advice practices · Free to use · No data stored
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#about" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>About</a>
        </div>
      </footer>
    </div>
  );
}
