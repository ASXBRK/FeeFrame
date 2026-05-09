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

export default function Terms({ onGoHome, onNavigate }: Props) {
  useDocumentMeta({ title: 'Terms of Use — FeeFrame', description: 'Terms of use for FeeFrame\'s free tools. Information only — not financial product advice.', ogUrl: 'https://feeframe.com/terms' });

  return (
    <>
      <Nav current="landing" onNavigate={p => onNavigate(p)} />
      <div className="min-h-screen bg-light flex flex-col">

        <header className="bg-white border-b border-light-border px-6 py-5">
          <div className="max-w-[720px] mx-auto flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>
                [ Terms of Use ]
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
              <h2 className={headingClass}>[ Terms of Use ]</h2>
              <p className={paraClass}>
                By using FeeFrame, you agree to these terms.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ What FeeFrame is ]</h3>
              <p className={paraClass}>
                FeeFrame is a free set of tools that help Australian financial advisers think through fee scoping, market comparison, and annual renewal documentation. It is information software — not a regulated advice product.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Not financial product advice ]</h3>
              <p className={paraClass}>
                FeeFrame is not financial product advice. The benchmarks, calculations, and document templates produced by FeeFrame are general information based on publicly available industry data and the inputs you provide. Use of FeeFrame does not create an adviser-client relationship between you and FeeFrame, nor between FeeFrame and any client of yours.
              </p>
              <p className={paraClass + ' mt-3'}>
                You remain solely responsible for the fees you charge, the documents you provide to clients, and your compliance with all applicable laws — including the Corporations Act, ASIC requirements, your AFSL conditions, and any licensee policy obligations.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ No warranty ]</h3>
              <p className={paraClass}>
                FeeFrame is provided as-is, without warranty of any kind. While we work to keep the benchmarks current and the calculations correct, we make no guarantee that the tool is error-free, complete, or suitable for any particular purpose.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Limitation of liability ]</h3>
              <p className={paraClass}>
                To the maximum extent permitted by law, FeeFrame and its contributors are not liable for any losses, damages, or claims arising from your use of the tool — including any decisions you make based on its outputs.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Acceptable use ]</h3>
              <p className={paraClass + ' mb-3'}>
                You may use FeeFrame for any lawful purpose connected to your work as an adviser, paraplanner, practice manager, licensee, or related role. You may not:
              </p>
              <ul className={listClass}>
                <li>Reverse-engineer, scrape, or copy the tool to create a substantially similar product</li>
                <li>Use FeeFrame in a way that violates any law or regulation</li>
                <li>Misrepresent FeeFrame's outputs as personal financial product advice to a retail client</li>
              </ul>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Changes to these terms ]</h3>
              <p className={paraClass}>
                These terms may be updated from time to time. The "last updated" date at the top of this page reflects when changes were made.
              </p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Governing law ]</h3>
              <p className={paraClass}>These terms are governed by the laws of Australia.</p>
            </section>

            <section>
              <h3 className={subheadingClass}>[ Contact ]</h3>
              <p className={paraClass}>
                Questions can be sent to{' '}
                <a href="mailto:[your-email@example.com]" className="text-teal hover:underline">
                  [your-email@example.com]
                </a>.
              </p>
            </section>

          </div>
        </main>

        <FooterBar
          currentPage="terms"
          onNavigate={p => {
            if (p === 'home') onGoHome();
            else onNavigate(p);
          }}
        />
      </div>
    </>
  );
}
