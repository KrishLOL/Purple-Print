/**
 * Parses a single raw `Set-Cookie` header string (as returned by
 * `Response.headers.getSetCookie()`) into a name/value/options shape
 * that can be passed directly to Next's `(await cookies()).set(...)`.
 *
 * Used to relay the session cookie Auth.js's own callback endpoint sets
 * when we fetch it server-to-server (see verifySignInCode in
 * app/auth/actions.ts) onto the actual response we send back to the
 * user's browser.
 */
export type ParsedCookie = {
  name: string;
  value: string;
  options: {
    path?: string;
    domain?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
};

export function parseSetCookie(header: string): ParsedCookie | null {
  const [nameValue, ...attrParts] = header.split(";").map((p) => p.trim());
  const eqIndex = nameValue.indexOf("=");
  if (eqIndex === -1) return null;

  const name = nameValue.slice(0, eqIndex);
  // The raw header value is already percent-encoded (that's how it got
  // written into a Set-Cookie header in the first place) -- Next's own
  // `cookies().set()` percent-encodes whatever value it's handed too, so
  // passing this straight through double-encodes it. Decode here so the
  // one encoding Next applies on the way back out is the only one.
  const value = decodeURIComponent(nameValue.slice(eqIndex + 1));
  const options: ParsedCookie["options"] = {};

  for (const part of attrParts) {
    const eq = part.indexOf("=");
    const key = (eq === -1 ? part : part.slice(0, eq)).toLowerCase();
    const val = eq === -1 ? "" : part.slice(eq + 1);

    switch (key) {
      case "path":
        options.path = val;
        break;
      case "domain":
        options.domain = val;
        break;
      case "expires": {
        const parsed = new Date(val);
        if (!Number.isNaN(parsed.getTime())) options.expires = parsed;
        break;
      }
      case "max-age": {
        const parsed = Number(val);
        if (!Number.isNaN(parsed)) options.maxAge = parsed;
        break;
      }
      case "httponly":
        options.httpOnly = true;
        break;
      case "secure":
        options.secure = true;
        break;
      case "samesite": {
        const lowered = val.toLowerCase();
        if (lowered === "lax" || lowered === "strict" || lowered === "none") options.sameSite = lowered;
        break;
      }
    }
  }

  return { name, value, options };
}
