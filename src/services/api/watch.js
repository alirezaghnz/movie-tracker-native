export async function getWatchData(imdbID, season, quality) {
  const res = await fetch(
    `http://192.168.1.106:3000/api/watch/${imdbID}?season=${season}&quality=${quality}`,
  );
  //console.log('get watch status:', res.status);

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
    /*
    console.log("get watch error body", parsed);
    const msg =
      parsed && typeof parsed === "object"
        ? parsed.message || parsed.error || JSON.stringify(parsed)
        : String(parsed);
    throw new Error(`Watch API ${res.status} - ${msg}`);
    */
    throw new Error("Network response was not OK:" + res.status);
  }

  //  console.log("get watch body", parsed);
  return res.json();
}
