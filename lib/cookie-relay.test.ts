import { describe, expect, it } from "vitest";
import { parseSetCookie } from "./cookie-relay";

describe("parseSetCookie", () => {
  it("parses a real Auth.js session cookie with an Expires date", () => {
    const parsed = parseSetCookie(
      "authjs.session-token=e68fd95e-aba2-4258-8380-4bdf1a1547f6; Path=/; Expires=Mon, 21 Sep 2026 23:18:41 GMT; HttpOnly; SameSite=Lax",
    );
    expect(parsed).toEqual({
      name: "authjs.session-token",
      value: "e68fd95e-aba2-4258-8380-4bdf1a1547f6",
      options: {
        path: "/",
        expires: new Date("Mon, 21 Sep 2026 23:18:41 GMT"),
        httpOnly: true,
        sameSite: "lax",
      },
    });
  });

  it("decodes a real Auth.js csrf cookie's percent-encoded pipe-separated value", () => {
    const parsed = parseSetCookie(
      "authjs.csrf-token=714c89e4c7db0352305f4786591f208d549e2834a8f979e6083a2b11cdf8b1e0%7Cde80a42e00093aaa431265d5cc7d878003ba59396d165a02d953bbf21a9af375; Path=/; HttpOnly; SameSite=Lax",
    );
    expect(parsed?.name).toBe("authjs.csrf-token");
    expect(parsed?.value).toBe(
      "714c89e4c7db0352305f4786591f208d549e2834a8f979e6083a2b11cdf8b1e0|de80a42e00093aaa431265d5cc7d878003ba59396d165a02d953bbf21a9af375",
    );
    expect(parsed?.options).toEqual({ path: "/", httpOnly: true, sameSite: "lax" });
  });

  it("decodes a percent-encoded URL value without truncating it at the encoded '='", () => {
    const parsed = parseSetCookie(
      "authjs.callback-url=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%3Ffoo%3Dbar; Path=/; HttpOnly; SameSite=Lax",
    );
    expect(parsed?.value).toBe("http://localhost:3000/auth/signin?foo=bar");
  });

  it("decodes exactly once -- a value must not come out still bearing escaped '%' sequences", () => {
    // Regression test: passing an already-decoded value straight through to
    // Next's cookies().set() (which re-encodes on write) double-encodes it,
    // and Auth.js then fails to parse the resulting %2520-style garbage --
    // this is what silently broke session recognition end to end (confirmed
    // live: InvalidCallbackUrl, thrown early enough in Auth.js's own request
    // handling that even an otherwise-valid session cookie never got read).
    const parsed = parseSetCookie("authjs.callback-url=http%3A%2F%2Flocalhost%3A3000; Path=/");
    expect(parsed?.value).not.toContain("%25");
    expect(parsed?.value).toBe("http://localhost:3000");
  });

  it("parses Secure and Max-Age attributes", () => {
    const parsed = parseSetCookie("foo=bar; Path=/; Max-Age=3600; Secure; SameSite=Strict");
    expect(parsed?.options).toEqual({ path: "/", maxAge: 3600, secure: true, sameSite: "strict" });
  });

  it("ignores an unrecognized SameSite value rather than passing it through", () => {
    const parsed = parseSetCookie("foo=bar; SameSite=Weird");
    expect(parsed?.options.sameSite).toBeUndefined();
  });

  it("returns null for a header with no '=' at all", () => {
    expect(parseSetCookie("not-a-cookie")).toBeNull();
  });

  it("handles a cookie with a Domain attribute", () => {
    const parsed = parseSetCookie("foo=bar; Domain=example.com; Path=/");
    expect(parsed?.options.domain).toBe("example.com");
  });
});
