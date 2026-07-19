const TMDB_BASE = "https://api.themoviedb.org/3";

function createTimeoutSignal(ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timeoutId) };
}

export async function validateToken(tokenTmdb) {
  const ping = createTimeoutSignal(7000);

  try {
    const pingResponse = await fetch(`${TMDB_BASE}/configuration`, {
      headers: { Authorization: `Bearer ${tokenTmdb}` },
      signal: ping.signal,
    });
    ping.cancel();

    if (pingResponse.status === 401) {
      return { ok: false, reason: "invalid_token" };
    }
    if (pingResponse.status === 403) {
      return { ok: false, reason: "forbidden" };
    }
    if (!pingResponse.ok) {
      return { ok: false, reason: "tmdb_error", status: pingResponse.status };
    }

    const test = createTimeoutSignal(7000);
    const testRes = await fetch(`${TMDB_BASE}/trending/movie/week`, {
      headers: { Authorization: `Bearer ${tokenTmdb}` },
      signal: test.signal,
    });
    test.cancel();

    if (!testRes.ok) {
      return { ok: false, reason: "api_error", status: testRes.status };
    }

    return { ok: true };
  } catch (err) {
    ping.cancel();
    //console.log("VALIDATE TOKEN CATCH");
    //console.log("name:", err.name);
    //console.log("message:", err.message);

    if (err.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "unknown_error" };
  }
}

// error Handeling
export function errorMessage(reason, status) {
  switch (reason) {
    case "invalid_token":
      return {
        title: "Invalid Token",
        body: "The TMDB token is invalid. Please enter a valid Read Access Token.",
      };

    case "forbidden":
      return {
        title: "Access Denied",
        body: "TMDB returned a 403 error. Your token may have been revoked or your account may be restricted.",
      };

    case "timeout":
      return {
        title: "Request Timed Out",
        body: "TMDB did not respond in time. Please check your internet connection and try again.",
      };

    case "unreachable":
      return {
        title: "TMDB Unreachable",
        body: "Unable to connect to api.themoviedb.org. Please check your internet connection.",
      };

    case "tmdb_error":
    case "api_error":
      return {
        title: "TMDB Server Error",
        body: `TMDB returned an unexpected response${
          status ? ` (HTTP ${status})` : ""
        }. Please try again later.`,
      };

    default:
      return {
        title: "Unexpected Error",
        body: `TMDB returned an unexpected error${
          status ? ` (HTTP ${status})` : ""
        }. Please try again later.`,
      };
  }
}
