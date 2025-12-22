export const addCacheBust = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('ts', String(Date.now()));
    return u.toString();
  } catch {
    return `${url}${url.includes('?') ? '&' : '?'}ts=${Date.now()}`;
  }
};
