import { randomUUID } from "node:crypto";
import type { Browser, BrowserContext } from "@playwright/test";
import { emailDomain, hashEmail } from "../../../lib/anonymize";
import { query } from "./db";

const SESSION_COOKIE_NAME = "authjs.session-token";

/** Every test user this suite creates uses this prefix, so cleanup can find them all. */
export const TEST_EMAIL_PREFIX = "pw-test-";

export type TestRole = "STUDENT" | "MOD" | "ADMIN";

export async function createTestUser(email: string, role: TestRole = "STUDENT"): Promise<{ id: string }> {
  const [existing] = await query<{ id: string }>(`SELECT id FROM "User" WHERE email = $1`, [email]);
  if (existing) {
    await query(`UPDATE "User" SET role = $1, "isBanned" = false, "hasOnboarded" = true WHERE id = $2`, [
      role,
      existing.id,
    ]);
    return existing;
  }

  const [created] = await query<{ id: string }>(
    `INSERT INTO "User" (id, email, "emailHash", "emailDomain", role, "hasOnboarded", "isBanned", "isSeedData", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, true, false, false, now(), now())
     RETURNING id`,
    [randomUUID(), email, hashEmail(email), emailDomain(email), role],
  );
  return created;
}

/** Creates a signed-in browser context for `email`, bypassing the magic-link UI flow. */
export async function createAuthenticatedContext(
  browser: Browser,
  email: string,
  role: TestRole = "STUDENT",
): Promise<BrowserContext> {
  const user = await createTestUser(email, role);

  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await query(
    `INSERT INTO "Session" (id, "sessionToken", "userId", expires) VALUES ($1, $2, $3, $4)`,
    [randomUUID(), sessionToken, user.id, expires],
  );

  const context = await browser.newContext();
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: Math.floor(expires.getTime() / 1000),
    },
  ]);
  return context;
}

/** Removes every user this suite has ever created, and cascades their data. Call before a run. */
export async function cleanupTestUsers(): Promise<void> {
  // ModerationLog.actorId is ON DELETE RESTRICT (an audit trail shouldn't
  // silently vanish when a real user is deleted), so test cleanup has to
  // clear those rows itself before removing the users that created them.
  await query(
    `DELETE FROM "ModerationLog" WHERE "actorId" IN (SELECT id FROM "User" WHERE email LIKE $1)`,
    [`${TEST_EMAIL_PREFIX}%`],
  );
  await query(`DELETE FROM "User" WHERE email LIKE $1`, [`${TEST_EMAIL_PREFIX}%`]);
}
