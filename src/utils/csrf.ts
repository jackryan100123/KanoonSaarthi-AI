export function getOrCreateCSRFToken() {
  let token = localStorage.getItem('csrfToken');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('csrfToken', token);
  }
  return token;
} 