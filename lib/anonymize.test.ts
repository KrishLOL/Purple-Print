import { describe, expect, it } from "vitest";
import { formatAuthorLabel } from "./anonymize";

describe("formatAuthorLabel", () => {
  it("formats discipline + grad year", () => {
    expect(formatAuthorLabel("Mechanical Engineering", 2027)).toBe("Mechanical Eng., Class of '27");
  });

  it("shortens 'First Year (Common)'", () => {
    expect(formatAuthorLabel("First Year (Common)", 2028)).toBe("First Year, Class of '28");
  });

  it("never includes a name or email", () => {
    const label = formatAuthorLabel("Software Engineering", 2025);
    expect(label).not.toMatch(/@/);
  });

  it("falls back gracefully when discipline is missing", () => {
    expect(formatAuthorLabel(null, 2026)).toBe("Class of '26");
  });

  it("falls back gracefully when grad year is missing", () => {
    expect(formatAuthorLabel("Civil Engineering", null)).toBe("Civil Eng.");
  });

  it("falls back to a generic label when both are missing", () => {
    expect(formatAuthorLabel(null, null)).toBe("Western Engineering student");
  });
});
