import Nav from '../../components/Nav';
import FooterBar from '../../components/shared/FooterBar';

interface Props {
  onGoHome: () => void;
  onNavigate: (page: string) => void;
}

const sectionHeadingClass = 'text-lg font-bold font-heading text-teal mb-3';
const paragraphClass = 'text-[15px] text-dark leading-relaxed';

export default function About({ onGoHome, onNavigate }: Props) {
  return (
    <>
      <Nav current="landing" onNavigate={p => onNavigate(p)} />
      <div className="min-h-screen bg-light flex flex-col">

        {/* Page header */}
        <header className="bg-white border-b border-light-border px-6 py-5">
          <div className="max-w-[720px] mx-auto flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>
                [ About FeeFrame ]
              </h1>
              <p className="text-sm text-mid mt-0.5">
                Free fee infrastructure for Australian advisers.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="text-xs text-mid hover:text-dark transition-colors"
            >
              ← Home
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-10 pb-16 max-w-[720px] w-full mx-auto">
          <div className="space-y-10">

            {/* Section 1 — The problem */}
            <section>
              <h2 className={sectionHeadingClass}>[ The problem ]</h2>
              <p className={paragraphClass}>
                Australian financial advice is in a fee paradox. Median ongoing fees have risen 67% in
                five years to $4,668 — driven by compliance costs of $38,000–$84,000 per adviser per
                year and a 40% drop in adviser numbers since 2018. Meanwhile, the average unadvised
                consumer will pay just $553 per year. The gap is widening. Most advisers know it.
                There's no good free tool to help them think it through.
              </p>
            </section>

            {/* Section 2 — Why FeeFrame exists */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>[ Why FeeFrame exists ]</h2>
              <p className={paragraphClass}>
                Australian financial advice has a fee problem.
              </p>
              <p className={paragraphClass}>
                Median ongoing fees have climbed 67% in five years. Adviser numbers have fallen 40%
                since the Royal Commission. Compliance costs run $39,000 to $84,000 per adviser per
                year. Meanwhile the average unadvised consumer will pay $553 a year for advice that
                costs $4,668 to deliver. Every fee conversation now sits in that tension.
              </p>
              <p className={paragraphClass}>
                Advisers know they need to charge enough to be sustainable. Clients know they're
                paying more than they used to. Regulators want every fee defensible. Licensees want
                consistency. None of those forces are going away.
              </p>
              <p className={paragraphClass}>
                What's missing is good infrastructure for thinking it through — and for free. Most
                existing tools are licensee-locked, paywalled, or built for the US or UK markets.
                There's no free, Australian-specific toolset for an adviser to scope a justified fee,
                benchmark it against the market, or generate the annual renewal document.
              </p>
              <p className={paragraphClass}>
                FeeFrame is that toolset.
              </p>
            </section>

            {/* Section 3 — Why three tools */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>[ Why three tools ]</h2>
              <p className={paragraphClass}>
                Fee work happens in three distinct moments, and each one deserves a focused tool
                rather than a multi-purpose feature stack.
              </p>
              <p className={paragraphClass}>
                <span className="font-semibold">FeeQuote</span> — for new client engagements. Build a
                justified fee from cost up: practice overheads, service mix, complexity, target
                margin. Output is a defensible number with a client letter ready to send.
              </p>
              <p className={paragraphClass}>
                <span className="font-semibold">FeeCompare</span> — for any moment of curiosity. Plot
                any fee against current Australian market data and your own cost-justified benchmark.
                Thirty seconds in, you know whether you're charging too much, too little, or somewhere
                defensible.
              </p>
              <p className={paragraphClass}>
                <span className="font-semibold">FeeReview</span> — for existing clients. Generate the
                annual fee consent and renewal letter required under DBFO reforms. Designed for
                practices without their own automated system.
              </p>
              <p className={paragraphClass}>
                A shared practice profile means you enter your overheads, salary structure, and margin
                once. The three tools are separate because the jobs are separate.
              </p>
            </section>

            {/* Section 4 — Why free */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>[ Why free ]</h2>
              <p className={paragraphClass}>
                Free isn't the marketing story. Free is the only positioning that makes sense.
              </p>
              <p className={paragraphClass}>
                The advice industry is already structurally challenged. Layering another paid tool on
                top of compliance costs, licensee fees, and PI insurance doesn't help anyone. Free
                maximises adoption, removes friction at the moment of decision, and keeps the focus on
                the work — defending fees, justifying value, sustaining a practice.
              </p>
            </section>

            {/* Section 5 — About the data */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>[ About the data ]</h2>
              <p className={paragraphClass}>
                FeeFrame benchmarks are sourced from Australia's most reputable industry research:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-dark leading-relaxed">
                <li>
                  <span className="font-semibold">Adviser Ratings 2025 Australian Financial Advice Landscape Report</span>
                  {' '}(median ongoing fee, fee trends, FUA per client)
                </li>
                <li>
                  <span className="font-semibold">Investment Trends 2025 Adviser Business Model Report</span>
                  {' '}(advice complexity splits, top-20% practice data)
                </li>
                <li>
                  <span className="font-semibold">KPMG/FSC Cost Profile of Advice Industry</span>
                  {' '}(cost-to-produce reference)
                </li>
                <li>
                  <span className="font-semibold">ATO SMSF Statistical Overview</span>
                  {' '}(SMSF operating costs)
                </li>
              </ul>
              <p className={paragraphClass}>
                The benchmark data refreshes annually. We're transparent about gaps — where Australian
                public data doesn't exist (single vs couple, metro vs regional, true percentile
                distributions), the tool says so rather than fabricating numbers.
              </p>
              <p className={paragraphClass}>
                Cost-justified anchors are computed from your own practice profile using a true-margin
                formula (
                <code className="font-mono text-[13px] bg-light-surface border border-light-border px-1.5 py-0.5 rounded">
                  fee = cost ÷ (1 − target margin)
                </code>
                ). Your practice data stays in your browser only — it's never transmitted, stored, or
                shared.
              </p>
            </section>

            {/* Section 6 — Contact */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>[ Contact ]</h2>
              <p className={paragraphClass}>
                Found a bug? Have feedback on the benchmarks or the tools? I'd genuinely like to hear
                it. This product gets better with adviser input.
              </p>
              <p className={paragraphClass}>
                Reach out at{' '}
                <a
                  href="mailto:[your-email@example.com]"
                  className="text-teal hover:underline"
                >
                  [your-email@example.com]
                </a>
                {' '}or via{' '}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:underline"
                >
                  [LinkedIn URL placeholder]
                </a>
                .
              </p>
            </section>

          </div>
        </main>

        <FooterBar
          currentPage="about"
          onNavigate={p => {
            if (p === 'home') onGoHome();
            else onNavigate(p);
          }}
        />
      </div>
    </>
  );
}
