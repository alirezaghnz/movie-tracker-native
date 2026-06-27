// Documentation:
// https://www.videasy.net/docs
// https://vsembed.su/api/
// https://www.vidking.net/#documentation

export const PLAYER_SOURCES = [
  {
    id: "videasy",
    name: "Videasy",
    tag: null,
    note: null,
    supportsProgress: true,
    colorParam: "color",
    langParam: null,
    params: {
      overlay: "true",
    },
    seriesUrl: (id, season, ep) =>
      `https://player.videasy.net/tv/${id}/${season}/${ep}`,
  },
  {
    id: "vidsrc",
    name: "Vidsrc",
    tag: null,
    note: null,
    supportsProgress: true,
    colorParam: "color",
    langParam: "ds_lang",
    params: {},
    seriesUrl: (id, season, ep) =>
      `https://vsembed.su/embed/tv/${id}/${season}/${ep}`,
  },
];

export const getSourceUrl = (
  sourceId,
  type,
  tmdbId,
  season,
  ep,
  extraParams = {},
  accentColor = null,
  subtitleLang = null,
) => {
  const src =
    PLAYER_SOURCES.find((s) => s.id === sourceId) ?? PLAYER_SOURCES[0];
  const baseUrl = src.seriesUrl(tmdbId, season, ep);
  const url = new URL(baseUrl);

  Object.entries(src.params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  if (accentColor && src.colorParam) {
    url.searchParams.set(src.colorParam, accentColor.replace(/^#/, ""));
  }
  if (subtitleLang && src.langParam) {
    url.searchParams.set(src.langParam, subtitleLang);
  }

  Object.entries(extraParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

/*
export async function getWatchData(imdbID, season, quality) {
  const res = await fetch(
    `http://192.168.1.108:3000/api/watch/${imdbID}?season=${season}&quality=${quality}`,
  );
  //console.log('get watch status:', res.status);

  
  //const raw = await res.clone().text();
  //let parsed;
  //try {
  //  parsed = raw ? JSON.parse(raw) : null;
  //} catch (e) {
  //  parsed = raw;
  //}
  
  if (!res.ok) {
    
    //console.log("get watch error body", parsed);
    //const msg =
    //  parsed && typeof parsed === "object"
    //    ? parsed.message || parsed.error || JSON.stringify(parsed)
    //    : String(parsed);
    //throw new Error(`Watch API ${res.status} - ${msg}`);
    
    throw new Error("Network response was not OK:" + res.status);
  }

  //  console.log("get watch body", parsed);
  return res.json();
}
*/
