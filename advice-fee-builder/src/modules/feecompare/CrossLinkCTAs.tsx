interface Props {
  onNavigate: (page: string) => void;
}

export default function CrossLinkCTAs({ onNavigate }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-sm font-bold font-heading text-dark mb-1">[ FeeQuote ]</h3>
        <p className="text-xs text-mid mb-4">
          Build a bottom-up fee from your time, overheads, and scope of work. Produces a justified fee quote with a detailed PDF.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('feequote')}
          className="text-sm font-medium text-teal hover:underline"
        >
          Open FeeQuote →
        </button>
      </div>

      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-sm font-bold font-heading text-dark mb-1">[ FeeReview ]</h3>
        <p className="text-xs text-mid mb-4">
          Generate a DBFO Act–aligned annual fee consent and renewal document. Combines OFA renewal and fee deduction consent in one PDF.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('feereview')}
          className="text-sm font-medium text-teal hover:underline"
        >
          Open FeeReview →
        </button>
      </div>
    </div>
  );
}
