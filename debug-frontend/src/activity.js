import { logEvent } from './api';

const ANON_ID_KEY = 'anon_id';

export function getOrCreateAnonId() {
  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}

export function logView(targetType, targetId) {
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const body = { event_type: 'view', target_type: targetType, target_id: targetId };
  if (!isLoggedIn) {
    body.anon_id = getOrCreateAnonId();
  }
  return logEvent(body).catch(() => {});
}
