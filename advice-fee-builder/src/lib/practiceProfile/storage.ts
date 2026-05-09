import type { PracticeProfile } from './types';

const STORAGE_KEY = 'feeframe.practiceProfile';
const CURRENT_VERSION = 1;

export function loadPracticeProfile(): PracticeProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PracticeProfile;
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('[FeeFrame] Practice profile version mismatch — clearing stale entry.');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    console.warn('[FeeFrame] Failed to load practice profile from localStorage.');
    return null;
  }
}

export function savePracticeProfile(profile: PracticeProfile): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    console.warn('[FeeFrame] Failed to save practice profile to localStorage.');
    return false;
  }
}

export function clearPracticeProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn('[FeeFrame] Failed to clear practice profile from localStorage.');
  }
}
