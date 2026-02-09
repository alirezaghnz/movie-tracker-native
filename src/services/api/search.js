export async function searchTitles(q) {
  if (!q || q.length < 2) return [];
  const res = await fetch(
    `http://192.168.1.106:3000/api/search?q=${encodeURIComponent(q)}`,
  );
  /*
  console.log('searchTitles status:', res.status);
  const raw = await res.clone().text();
  let parsed;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    parsed = raw;
  }
 */
  if (!res.ok) {
    /*
    console.log("search error body", parsed);
    const msg =
      parsed && typeof parsed === "object"
        ? parsed.message || parsed.error || JSON.stringify(parsed)
        : String(parsed);
    throw new Error(`Search API ${res.status} - ${msg}`);
    */
    throw new Error("Network response was not OK:" + res.status);
  }

  //console.log("search body", parsed);
  return res.json();
}
