import Nav from '../../components/Nav';
import FooterBar from '../../components/shared/FooterBar';
import { useDocumentMeta } from '../../lib/useDocumentMeta';

interface Props {
  onGoHome: () => void;
  onNavigate: (page: string) => void;
}

const headingClass = 'text-lg font-bold font-heading text-teal mb-3';
const subheadingClass = 'text-base font-semibold font-heading text-dark mb-2 mt-6';
const paraClass = 'text-[15px] text-dark leading-relaxed';
const listClass = 'text-[15px] text-dark leading-relaxed list-disc pl-5 space-y-1';

export default function Privacy({ onGoHome, onNavigate }: Props) {
  useDocumentMeta({ title: 'Privacy Policy — FeeFrame', description: 'How FeeFrame handles data: minimal collection, browser-only practice profile, no advice data transmitted.', ogUrl: 'https://feeframe.com/privacy' });

  return (
    <>
      <Nav current="landing" onNavigate={p => onNavigate(p)} />
      <div className="min-h-screen bg-light flex flex-col">

        <header className="bg-white border-b border-light-border px-6 py-5">
          <div className="max-w-[720px] mx-auto flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>
                [ Privacy Policy ]
              </h1>
              <p className="text-sm text-mid mt-0.5">Last updated: May 2026</p>
            </div>
            <button onClick={onGoHome} className="text-xs text-mid hover:text-dark transition-colors">
              ← Home
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-10 pb-16 max-w-[720px] w-full mx-auto">
          <div className="space-y-8">

            <section>
              <h2 className={headingClass}>[ Privacy Policy ]</h2>
              <p className={paraClass}>
                FeeFrame is committed to protecting your privacy. This policy describes what data we collect, how we use it, and how we protect it.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ What FeeFrame collects ]</h3>
              <p className={paraClass + ' mb-3'}>FeeFrame collects only the data necessary to operate the tool. Specifically:</p>
              <ul className={listClass}>
                <li>
                  <span className="font-semibold">Anonymous usage data</span> via Vercel Analytics — page views, browser type, country, and approximate region. No personally identifying information is collected. No cookies are set.
                </li>
                <li>
                  <span className="font-semibold">Practice profile data</span> that you optionally save — overheads, salary, billable hours, target margin. This is stored only in your browser's local storage. It is never transmitted to FeeFrame's servers.
                </li>
                <li>
                  <span className="font-semibold">Form inputs</span> for fee scoping, comparison, or renewal — these never leave your browser.
                </li>
              </ul>
            </section>

            <section>
              <h3 className={subheadingClass}>[ What FeeFrame does NOT collect ]</h3>
              <ul className={listClass}>
                <li>No client information you enter into FeeQuote or FeeReview is transmitted, stored, or shared by FeeFrame.</li>
                <li>No fee values, FUA values, or practice profile values are sent to any third party — including FeeFrame's analytics provider.</li>
                <li>No accounts. No login. No email collection unless you contact us directly.</li>
              </ul>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Third-party services ]</h3>
              <p className={paraClass}>
                FeeFrame is hosted on Vercel and uses Vercel Analytics for anonymous traffic measurement. Vercel's privacy practices are documented at{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                  vercel.com/legal/privacy-policy
                </a>.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Your data, your browser ]</h3>
              <p className={paraClass}>
                Practice profile data stays in the browser you saved it from. Clearing your browser's local storage (or clicking the "Clear" action on the practice profile pill) removes it permanently. There is no backup, no sync, no cloud copy.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Changes to this policy ]</h3>
              <p className={paraClass}>
                If FeeFrame changes how it handles data, this page will be updated. Material changes will be communicated through the FeeFrame website.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Contact ]</h3>
              <p className={paraClass}>
                Questions about privacy can be sent to{' '}
                <a href="mailto:[your-email@example.com]" className="text-teal hover:underline">
                  [your-email@example.com]
                </a>.
              </p>
            </section>

          </div>
        </main>

        <FooterBar
          currentPage="privacy"
          onNavigate={p => {
            if (p === 'home') onGoHome();
            else onNavigate(p);
          }}
        />
      </div>
    </>
  );
}
