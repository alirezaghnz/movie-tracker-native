export async function getTitleDetails(imdbID) {
  const res = await fetch(`http://192.168.1.106:3000/api/title/${imdbID}`);
  //console.log('getTitleDetails status:', res.status);

  /*
  const raw = await res.clone().text();
  let parsed;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    parsed = raw;
  }
  */
  if (!res.ok) {
    /*console.log("get title details error body", parsed);
    const msg =
      parsed && typeof parsed === "object"
        ? parsed.message || parsed.error || JSON.stringify(parsed)
        : String(parsed);
    throw new Error(`Title API ${res.status} - ${msg}`);
    */
    throw new Error("Network response was not OK:" + res.status);
  }

  //console.log("getTitleDetails body", parsed);
  return res.json();
}
