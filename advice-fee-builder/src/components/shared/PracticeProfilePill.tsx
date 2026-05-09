import type { PracticeProfile } from '../../lib/practiceProfile/types';

interface Props {
  profile: PracticeProfile | null;
  onEdit: () => void;
  onClear: () => void;
}

export default function PracticeProfilePill({ profile, onEdit, onClear }: Props) {
  if (!profile) {
    return (
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 text-xs text-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 rounded"
      >
        <span className="text-teal font-semibold">+</span> Add practice profile to see cost-justified comparison
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-teal-subtle border border-teal/30 rounded-full px-3 py-1 text-xs text-dark">
      <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
      <span className="font-medium">
        {profile.practiceName ? profile.practiceName : 'Practice profile'} loaded
      </span>
      <span className="text-mid">·</span>
      <button onClick={onEdit} className="text-teal hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 rounded">Edit</button>
      <span className="text-mid">·</span>
      <button onClick={onClear} className="text-mid hover:text-risk transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 rounded">Clear</button>
    </div>
  );
}
