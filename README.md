[![Downloads@latest](https://img.shields.io/github/downloads/alirezaghnz/movie-tracker-native/latest/total?style=for-the-badge)](https://github.com/alirezaghnz/movie-tracker-native/releases/latest/)
[![Release Version Badge](https://img.shields.io/github/v/release/alirezaghnz/movie-tracker-native?style=for-the-badge)](https://github.com/alirezaghnz/movie-tracker-native/releases)
[![Issues Badge](https://img.shields.io/github/issues/alirezaghnz/movie-tracker-native?style=for-the-badge)](https://github.com/alirezaghnz/movie-tracker-native/issues)

# IronBranch 🎬

A free & open-source Android app to stream any TV series in the world. Zero ads, zero tracking, zero cost.

---

## Why IronBranch?

- 🎦 **Streaming** — Watch any TV series from around the world, directly on your Android device
- 🔍 **Discovery** — Browse trending and top-rated series powered by TMDB
- ❤️ **Favorites** — Save and manage your favorite
- 🔒 **Privacy** — Your TMDB token is stored securely on your device. No servers, no accounts, no tracking
- 📦 **No Play Store** — Install directly via APK. No Google account needed

---

## Screenshots

> Coming soon

---

## Streaming

IronBranch gets video streams from third-party providers.
Series metadata (posters, descriptions, ratings, episodes) is fetched from [TMDB](https://www.themoviedb.org/).

---

## Requirements

- An Android device (Android 8.0+)
- A free TMDB Read Access Token → [Get one here](https://www.themoviedb.org/settings/api)

---

## Installation

1. Download the latest `.apk` from the [Releases](https://github.com/alirezaghnz/movie-tracker-native/releases/latest) page
2. Enable **"Install from unknown sources"** in your Android settings
3. Install the APK
4. Open the app and enter your TMDB Read Access Token
5. Start watching 🎉
   > Your token is saved locally and securely — you only need to do this once.

---

## Building from Source

1. Clone the repository:

```bash
git clone https://github.com/alirezaghnz/movie-tracker-native.git

```

2. Install dependencies:

```bash
npm install
```

3. Start development:

```bash
npx expo start
```

4. Build APK:

```bash
eas build -p android --profile preview
```

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).

---

## Legal Disclaimer

**This application is for educational and personal use only.**

- IronBranch does not host, store, or distribute any copyrighted content
- All content is sourced from third-party providers
- Users are solely responsible for ensuring they have legal rights to access any content
- The developer does not endorse or encourage copyright infringement
- Users must comply with all applicable laws in their jurisdiction
- No copyrighted material is stored on the developer's side

---

## Privacy

IronBranch itself does not collect **any** data. There is no backend server.
Your TMDB token is stored only on your device using the OS keychain (Android Keystore).

However, third-party streaming sources and TMDB may collect data according to their own privacy policies.
