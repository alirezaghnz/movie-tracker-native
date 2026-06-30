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
    console.log("=== VALIDATE TOKEN CATCH ===");
    console.log("name:", err.name);
    console.log("message:", err.message);

    if (err.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "unknown_error" };
  }
}

export function errorMessage(reason, status) {
  switch (reason) {
    case "invalid_token":
      return {
        title: "توکن نامعتبر",
        body: " توکن TMDB نامعتبر است. Read Access Token را وارد کنید.",
      };
    case "forbidden":
      return {
        title: "دسترسی غیرمجاز",
        body: "TMDB خطای 403 برگرداند. ممکن است حساب شما مسدود شده یا توکن لغو شده باشد.",
      };
    case "timeout":
      return {
        title: "اتمام زمان درخواست",
        body: "TMDB پاسخ نداد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.",
      };
    case "unreachable":
      return {
        title: "عدم دسترسی به TMDB",
        body: "اتصال به api.themoviedb.org برقرار نشد. اینترنت خود را بررسی کنید.",
      };
    case "tmdb_error":
    case "api_error":
      return {
        title: "خطای سرور TMDB",
        body: `سرور TMDB پاسخ غیرمنتظره‌ای داد${status ? ` (HTTP ${status})` : ""}. لطفاً دوباره تلاش کنید.`,
      };
    default:
      return {
        title: "خطای غیرمنتظره",
        body: `TMDB یک خطای غیرمنتظره برگرداند${status ? ` (HTTP ${status})` : ""}. لطفاً دوباره تلاش کنید.`,
      };
  }
}
