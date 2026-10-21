// Documentation:

// https://vsembed.su/api/

export const PLAYER_SOURCES = [
  {
    id: "vidsrc",
    name: "Vidsrc",
    tag: null,
    note: null,
    supportsProgress: true,
    colorParam: "color",
    langParam: "ds_lang",
    params: {
      autoplay: "1",
    },
    seriesUrl: (id, season, ep) =>
      `https://vsembed.su/embed/tv/${id}/${season}/${ep}`,
    movieUrl: (id) => `https://vsembed.su/embed/movie/${id}`,
  },
  {
    id: "peachify",
    name: "Peachify",
    tag: null,
    note: "Movies only",
    supportsProgress: true,
    colorParam: "accent", // hex without # → e.g. "e50914"
    langParam: "sub",
    params: {
      autoPlay: "true",
      pip: "hide",
      cast: "hide",
    },
    seriesUrl: (id, season, ep) =>
      `https://peachify.top/embed/tv/${id}/${season}/${ep}`,
    movieUrl: (id) => `https://peachify.top/embed/movie/${id}`,
  },
  {
    id: "vidrift",
    name: "Vidrift",
    tag: null,
    note: "Multi Lang",
    supportsProgress: true,
    colorParam: "brandColor",
    langParam: "sub",
    params: {
      title: "true",
      hide: "next,episodes,cast",
    },
    seriesUrl: (id, season, ep) =>
      `https://embed.vidrift.net/embed/tv/${id}/${season}/${ep}`,
    movieUrl: (id) => `https://embed.vidrift.net/embed/movie/${id}`,
  },
  {
    id: "aether",
    name: "Aether",
    tag: null,
    note: "Multi Lang", // Has multiple audio languages
    supportsProgress: true,
    colorParam: null,
    langParam: null,
    params: {},
    seriesUrl: (id, season, ep) =>
      `https://aether.ist/media/tmdb-tv-${id}/${season}/${ep}`,
    movieUrl: (id) => `https://aether.ist/media/tmdb-movie-${id}`,
  },
  {
    id: "vidlove",
    name: "Vidlove",
    tag: null,
    note: null,
    supportsProgress: true,
    colorParam: "primarycolor", // hex without # → e.g. "e50914"
    params: {
      autoplay: "true",
      autonext: "false",
      tour: "true",
      showNextEpisode: "false",
      hideautonext: "true",
      hidenextbutton: "true",
    },
    seriesUrl: (id, season, ep) =>
      `https://player.vidlove.cc/embed/tv/${id}/${season}/${ep}`,
    movieUrl: (id) => `https://player.vidlove.cc/embed/movie/${id}`,
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
  const baseUrl =
    type === "tv" ? src.seriesUrl(tmdbId, season, ep) : src.movieUrl(tmdbId);
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
