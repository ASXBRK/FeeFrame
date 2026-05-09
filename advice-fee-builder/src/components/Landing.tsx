import { useState, useEffect, useRef } from 'react';
import feeframeLogo from '../assets/logos/feeframe-light.svg';
import feequoteLogo from '../assets/logos/feequote-light.svg';
import feecompareLogo from '../assets/logos/feecompare-light.svg';
import feereviewLogo from '../assets/logos/feereview-light.svg';
import FooterBar from './shared/FooterBar';

export default function Landing({ onStartCompare, onStartQuote, onStartReview, onNavigate }: { onStartCompare: () => void; onStartQuote: () => void; onStartReview: () => void; onNavigate: (page: string) => void }) {
  const [compareHovered, setCompareHovered] = useState(false);
  const [quoteHovered, setQuoteHovered] = useState(false);
  const [reviewHovered, setReviewHovered] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.target === cardsRef.current && e.isIntersecting) setCardsVisible(true);
          if (e.target === videoRef.current && e.isIntersecting) setVideoVisible(true);
        });
      },
      { threshold: 0.15 }
    );
    if (cardsRef.current) observer.observe(cardsRef.current);
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const slideBtn = (hovered: boolean): React.CSSProperties => ({
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    letterSpacing: '0.05em',
    background: '#111827',
    color: hovered ? '#0d9488' : '#f8fafc',
    border: 'none',
    borderRadius: '0px',
    padding: '18px 36px',
    cursor: 'pointer',
    transition: 'color 0.3s ease-out',
    textTransform: 'uppercase' as const,
  });

  const slideOverlay = (hovered: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    background: '#ffffff',
    transform: hovered ? 'translateX(0%)' : 'translateX(-101%)',
    transition: 'transform 0.3s ease-out',
    zIndex: 0,
  });

  const btnText: React.CSSProperties = { position: 'relative', zIndex: 1 };

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      <style>{`
        @keyframes blobOne {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.7; }
          33%      { transform: translate(40px,-30px) scale(1.05); opacity:0.85; }
          66%      { transform: translate(-20px,20px) scale(0.97); opacity:0.65; }
        }
        @keyframes blobTwo {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.6; }
          33%      { transform: translate(-50px,30px) scale(1.08); opacity:0.8; }
          66%      { transform: translate(30px,-20px) scale(0.95); opacity:0.55; }
        }
        ::selection { background:#0d9488; color:#fff; }
        ::-webkit-scrollbar { width:8px; }
        ::-webkit-scrollbar-track { background:#f8fafc; }
        ::-webkit-scrollbar-thumb { background:#0d9488; border-radius:4px; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative',
        background: '#ffffff',
        padding: '100px 48px 96px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'hidden',
        minHeight: '92vh',
        justifyContent: 'center',
      }}>

        {/* Blob 1 */}
        <div style={{
          position: 'absolute', width: '60vw', height: '60vw',
          background: '#0d9488', borderRadius: '50%',
          filter: 'blur(140px)', opacity: 0.18,
          top: '-10vw', left: '-10vw',
          animation: 'blobOne 12s ease-in-out infinite',
          mixBlendMode: 'multiply', pointerEvents: 'none',
        }} />

        {/* Blob 2 */}
        <div style={{
          position: 'absolute', width: '50vw', height: '50vw',
          background: '#0d9488', borderRadius: '50%',
          filter: 'blur(120px)', opacity: 0.13,
          bottom: '-8vw', right: '-8vw',
          animation: 'blobTwo 15s ease-in-out infinite',
          mixBlendMode: 'multiply', pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* FeeFrame logo */}
          <div style={{ marginBottom: '56px', display: 'flex', justifyContent: 'center' }}>
            <img src={feeframeLogo} alt="FeeFrame" style={{ height: '100px', width: 'auto' }} />
          </div>

          {/* Massive headline */}
          <h1 style={{
            fontWeight: 800,
            fontSize: 'clamp(48px, 8vw, 100px)',
            color: '#111827',
            letterSpacing: '-3px',
            lineHeight: 0.92,
            marginBottom: '40px',
            textTransform: 'uppercase',
          }}>
            Fee clarity for<br />
            <span style={{ color: '#111827' }}>Australian advisers.</span>
          </h1>

          {/* Subline */}
          <p style={{ fontSize: '20px', fontWeight: 400, color: '#6b7280', marginBottom: '52px', maxWidth: '440px', lineHeight: 1.5, margin: '0 auto 52px' }}>
            Know what to charge. Know your profitability.
          </p>

          {/* Primary CTA — FeeCompare */}
          <div style={{ marginBottom: '20px' }}>
            <button onClick={onStartCompare} onMouseEnter={() => setCompareHovered(true)} onMouseLeave={() => setCompareHovered(false)} style={slideBtn(compareHovered)}>
              <div style={slideOverlay(compareHovered)} />
              <span style={btnText}>Benchmark your fee →</span>
            </button>
          </div>

          {/* Secondary CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button onClick={onStartQuote} onMouseEnter={() => setQuoteHovered(true)} onMouseLeave={() => setQuoteHovered(false)} style={{ ...slideBtn(quoteHovered), fontSize: '14px', padding: '12px 24px' }}>
              <div style={slideOverlay(quoteHovered)} />
              <span style={btnText}>FeeQuote →</span>
            </button>
            <button onClick={onStartReview} onMouseEnter={() => setReviewHovered(true)} onMouseLeave={() => setReviewHovered(false)} style={{ ...slideBtn(reviewHovered), fontSize: '14px', padding: '12px 24px' }}>
              <div style={slideOverlay(reviewHovered)} />
              <span style={btnText}>FeeReview →</span>
            </button>
          </div>

          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            No login. No data stored. Just fees, [framed].
          </p>

        </div>
      </section>

      {/* ── Tool Cards ── */}
      <div ref={cardsRef}>
        <section style={{
          padding: '96px 48px 120px',
          display: 'flex',
          justifyContent: 'center',
          opacity: cardsVisible ? 1 : 0,
          transform: cardsVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1400px' }}>

            {/* FeeCompare — hero card, full width */}
            <div
              onClick={onStartCompare}
              style={{ background: '#ffffff', borderRadius: '12px', border: '2px solid #0d9488', padding: '64px 80px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(13,148,136,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '14px', color: '#0d9488', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Start here
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <img src={feecompareLogo} alt="FeeCompare" style={{ height: '96px', width: 'auto' }} />
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: '32px', color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
                    Is your fee in range?
                  </h2>
                  <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', color: '#6b7280', lineHeight: 1.65, marginBottom: '32px' }}>
                    Enter a fee and see instantly how it sits against 2025 Australian market data. No login, no setup.
                  </p>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#0d9488', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Compare now →
                  </div>
                </div>
              </div>
            </div>

            {/* FeeQuote + FeeReview — secondary 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

              <div
                onClick={onStartQuote}
                style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '64px 56px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ marginBottom: '36px' }}>
                  <img src={feequoteLogo} alt="FeeQuote" style={{ height: '96px', width: 'auto' }} />
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '32px', color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
                  What should I charge?
                </h2>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', color: '#6b7280', lineHeight: 1.65, marginBottom: '48px', flex: 1 }}>
                  Scope a new engagement and generate a fee you can justify — time, overheads, and scope in one place.
                </p>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0d9488', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Start quoting →
                </div>
              </div>

              <div
                onClick={onStartReview}
                style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '64px 56px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ marginBottom: '36px', height: '96px', display: 'flex', alignItems: 'center' }}>
                  <img src={feereviewLogo} alt="FeeReview" style={{ height: '96px', width: 'auto' }} />
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '32px', color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
                  Time to renew?
                </h2>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', color: '#6b7280', lineHeight: 1.65, marginBottom: '48px', flex: 1 }}>
                  Generate a DBFO Act–aligned annual fee consent and renewal document. OFA and fee deduction consent in one PDF.
                </p>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0d9488', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Start a renewal →
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ── Video ── */}
      <div ref={videoRef}>
        <section style={{
          background: '#111827',
          padding: '96px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: videoVisible ? 1 : 0,
          transform: videoVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <p style={{ fontWeight: 700, fontSize: '32px', color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '56px' }}>
            [ How it works ]
          </p>
          <div
            style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.01)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: '72px', height: '72px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '24px solid #fff', marginLeft: '6px' }} />
            </div>
            <p style={{ fontSize: '15px', color: '#6b7280' }}>Video coming soon</p>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <FooterBar
        currentPage="home"
        onNavigate={(page) => {
          if (page === 'feecompare') onStartCompare();
          else if (page === 'feequote') onStartQuote();
          else if (page === 'feereview') onStartReview();
          else onNavigate(page);
        }}
      />

    </div>
  );
}
