const STORAGE_KEY = 'referral_source';

export function captureReferralSource() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem(STORAGE_KEY, ref);
  }
}

export function getReferralSource() {
  return localStorage.getItem(STORAGE_KEY);
}
