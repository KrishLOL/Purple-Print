import { describe, expect, it } from "vitest";
import { normalizeProfessorName, slugifyProfessorName, splitDisplayName } from "./professor-suggestions";

describe("normalizeProfessorName", () => {
  it("folds case and collapses whitespace", () => {
    expect(normalizeProfessorName("  John   Smith ")).toBe("john smith");
    expect(normalizeProfessorName("JOHN SMITH")).toBe("john smith");
  });

  it("strips a leading title so 'Dr. Smith' and 'Smith' de-duplicate", () => {
    expect(normalizeProfessorName("Dr. Smith")).toBe("smith");
    expect(normalizeProfessorName("Professor Smith")).toBe("smith");
    expect(normalizeProfessorName("Smith")).toBe("smith");
  });

  it("does not fold two genuinely different names to the same key", () => {
    expect(normalizeProfessorName("John Smith")).not.toBe(normalizeProfessorName("Jane Smith"));
  });
});

describe("splitDisplayName", () => {
  it("splits a two-word name into first/last", () => {
    expect(splitDisplayName("John Smith")).toEqual({ firstName: "John", lastName: "Smith" });
  });

  it("puts every leading word into firstName for a multi-word name", () => {
    expect(splitDisplayName("Mary Jane Watson")).toEqual({ firstName: "Mary Jane", lastName: "Watson" });
  });

  it("treats a single word as a last name with no first name", () => {
    expect(splitDisplayName("Smith")).toEqual({ firstName: "", lastName: "Smith" });
  });
});

describe("slugifyProfessorName", () => {
  it("kebab-cases a name", () => {
    expect(slugifyProfessorName("John", "Smith")).toBe("john-smith");
  });

  it("strips punctuation", () => {
    expect(slugifyProfessorName("Anne-Marie", "O'Brien")).toBe("anne-marie-obrien");
  });
});
