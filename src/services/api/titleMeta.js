export async function getTitleMeta(imdbID) {
  const res = await fetch(`http://192.168.1.106:3000/api/title/${imdbID}/meta`);

  if (!res.ok) throw new Error(`meta error: ${res.status}`);

  return await res.json();
}
