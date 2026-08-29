import crypto from "node:crypto";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

// This link is never shown to the visitor — it's only ever sent to the sales
// team's inbox (see mailer.ts), so it needs to stay valid long enough for a
// human to act on it, not just for one browser session.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createDownloadToken(projectSlug: string, docId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${projectSlug}:${docId}:${exp}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyDownloadToken(
  token: string,
  projectSlug: string,
  docId: string
): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [slug, id, expStr, sig] = decoded.split(":");
    if (slug !== projectSlug || id !== docId) return false;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;

    const payload = `${slug}:${id}:${expStr}`;
    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}
