const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;

  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '');

  if (!res.ok) {
    const message = typeof data === 'string'
      ? data
      : data?.error || data?.message || 'Request failed';
    throw new Error(`${res.status} ${res.statusText}: ${message}`);
  }

  return data;
}

export const signup = (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
export const login = (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const getMe = () => request('/api/auth/me');

export const getDrones = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/drones${qs ? `?${qs}` : ''}`);
};
export const getDrone = (id) => request(`/api/drones/${id}`);
export const createDrone = (body) => request('/api/drones', { method: 'POST', body: JSON.stringify(body) });
export const updateDrone = (id, body) => request(`/api/drones/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const getTestimonials = (droneId) => request(`/api/drones/${droneId}/testimonials`);
export const createTestimonial = (droneId, body) => request(`/api/drones/${droneId}/testimonials`, { method: 'POST', body: JSON.stringify(body) });

export const getArticles = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/articles${qs ? `?${qs}` : ''}`);
};
export const getAllArticles = () => request('/api/articles/all');
export const getArticle = (slug) => request(`/api/articles/${slug}`);
export const createArticle = (body) => request('/api/articles', { method: 'POST', body: JSON.stringify(body) });
export const updateArticle = (id, body) => request(`/api/articles/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const getGallery = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/gallery${qs ? `?${qs}` : ''}`);
};
export const createGalleryItem = (body) => request('/api/gallery', { method: 'POST', body: JSON.stringify(body) });

export const getInquiries = () => request('/api/inquiries');
export const createInquiry = (body) => request('/api/inquiries', { method: 'POST', body: JSON.stringify(body) });
export const updateInquiry = (id, body) => request(`/api/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const toggleFavorite = (body) => request('/api/favorites', { method: 'POST', body: JSON.stringify(body) });
export const getFavorites = () => request('/api/favorites');
export const getLanding = () => request('/api/landing');

export const subscribeNewsletter = (body) => request('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify(body) });