import { useCallback, useEffect, useState } from "react";
import { useFavorites } from "./useFavorites";
import { checkForAnyNewEpisode } from "../utils/checkNewEpisode";

export function useHasNewEpisodes() {
  const { favorites } = useFavorites();
  const [hasNew, setHasNew] = useState(false);

  const check = useCallback(async () => {
    const result = await checkForAnyNewEpisode(favorites);
    setHasNew(result);
  }, [favorites]);

  useEffect(() => {
    check();
  }, [check]);

  return { hasNew, recheck: check };
}
