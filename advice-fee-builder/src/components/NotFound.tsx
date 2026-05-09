import Nav from './Nav';
import FooterBar from './shared/FooterBar';

interface Props {
  onNavigate: (page: string) => void;
}

export default function NotFound({ onNavigate }: Props) {
  return (
    <>
      <Nav current="landing" onNavigate={onNavigate} />
      <div className="min-h-screen bg-light flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-[520px] w-full text-center space-y-6">
            <h1 className="text-xl font-bold font-heading text-teal" style={{ letterSpacing: '-0.3px' }}>
              [ Page not found ]
            </h1>
            <p className="text-[15px] text-mid leading-relaxed">
              The page you're looking for doesn't exist. Try one of the tools below.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('feecompare')}
                className="text-[15px] font-semibold text-teal hover:underline"
              >
                → Compare a fee
              </button>
              <button
                onClick={() => onNavigate('feequote')}
                className="text-[15px] font-semibold text-teal hover:underline"
              >
                → Build a fee
              </button>
              <button
                onClick={() => onNavigate('feereview')}
                className="text-[15px] font-semibold text-teal hover:underline"
              >
                → Renew a fee
              </button>
            </div>
            <p className="pt-2">
              <button
                onClick={() => onNavigate('home')}
                className="text-sm text-mid hover:text-dark transition-colors"
              >
                or back to home
              </button>
            </p>
          </div>
        </main>
        <FooterBar
          currentPage="home"
          onNavigate={p => onNavigate(p)}
        />
      </div>
    </>
  );
}
