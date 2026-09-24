// Server-side check for Cloudflare Turnstile (the invisible "are you human"
// widget on the lead forms). Entirely optional: with TURNSTILE_SECRET_KEY
// unset, every submission passes and the site relies on the honeypot and
// rate limit alone. Set it together with NEXT_PUBLIC_TURNSTILE_SITE_KEY.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (err) {
    // Cloudflare unreachable: let the lead through rather than lose it — the
    // honeypot and rate limit still apply.
    console.error("Turnstile verification failed to run:", err);
    return true;
  }
}
