export function rorUrl(value) {
  if (typeof value !== 'string') return null;
  const id = value.replace(/^https:\/\/ror\.org\//, '');
  return /^0[0-9a-hj-km-np-tv-z]{6}[0-9]{2}$/.test(id) ? `https://ror.org/${id}` : null;
}
