import { createContext, useCallback, useContext, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { checkForAnyNewEpisode } from "../utils/checkNewEpisode";

const NewEpisodesContext = createContext();

export function NewEpisodesProvider({ children }) {
  const { favorites } = useFavorites();
  const [hasNew, setHasNew] = useState(false);

  const recheck = useCallback(async () => {
    const result = await checkForAnyNewEpisode(favorites);
    setHasNew(result);
  }, [favorites]);

  return (
    <NewEpisodesContext.Provider value={{ hasNew, recheck }}>
      {children}
    </NewEpisodesContext.Provider>
  );
}

export function useNewEpisodesContext() {
  const ctx = useContext(NewEpisodesContext);
  if (!ctx) {
    throw new Error(
      "useNewEpisodesContext must be used within a NewEpisodesProvider",
    );
  }
  return ctx;
}
