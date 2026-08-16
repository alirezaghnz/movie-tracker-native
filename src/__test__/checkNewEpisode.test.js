jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("../services/api/tmdb");
jest.mock("../storage/seenEpisode.storage");

import { checkForAnyNewEpisode } from "../utils/checkNewEpisode";
import * as tmdb from "../services/api/tmdb";
import * as storage from "../storage/seenEpisode.storage";

beforeEach(() => {
  jest.clearAllMocks();
});

test("detects new episode when latest ID differs from seen", async () => {
  // suppose the last seen ep was 7196570
  storage.getSeenEpisodes.mockResolvedValue({ 94997: 7196570 });

  // suppose the last episode to air is 7196571
  tmdb.getTVDetails.mockResolvedValue({
    last_episode_to_air: { id: 7196571 },
  });

  const favorites = [{ id: 94997, type: "tv" }];
  const result = await checkForAnyNewEpisode(favorites);

  expect(result).toBe(true); // expect that a new episode is detected
});

test("returns false when no new episode", async () => {
  storage.getSeenEpisodes.mockResolvedValue({ 94997: 7196571 });
  tmdb.getTVDetails.mockResolvedValue({
    last_episode_to_air: { id: 7196571 },
  });

  const favorites = [{ id: 94997, type: "tv" }];
  const result = await checkForAnyNewEpisode(favorites);

  expect(result).toBe(false);
});
