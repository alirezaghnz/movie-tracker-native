//Xiaomi Redmi Note → 1080×2400
//Samsung A series  → 1080×2340
//Pixel 6a          → 1080×2400
//Old android        → 720×1280

import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 360; // base Android

export const wp = (size) => Math.round(size * scale); // width
export const hp = (size) => Math.round((size / 800) * SCREEN_HEIGHT); // height

//font responsive
export const fp = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
