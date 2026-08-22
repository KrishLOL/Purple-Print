import { describe, expect, it } from "vitest";
import {
  buildPrereqGraph,
  canonicalKey,
  computeLayoutColumns,
  extractPrereqCanonicalKeys,
  selectDisciplineSubgraph,
  type GraphEdge,
  type PrereqCourseInput,
} from "./prereq-graph";

describe("canonicalKey", () => {
  it("strips section-letter suffixes so different formats of the same course match", () => {
    expect(canonicalKey("ES 1022Y")).toBe("ES1022");
    expect(canonicalKey("NMM 1414A/B")).toBe("NMM1414");
    expect(canonicalKey("CBE 4497")).toBe("CBE4497");
    expect(canonicalKey("IE 2200Y")).toBe("IE2200");
    expect(canonicalKey("MME 2200Q/R/S/T")).toBe("MME2200");
  });
});

describe("extractPrereqCanonicalKeys", () => {
  const prefixes = ["NMM", "ES", "CHEM", "PHYS", "CBE", "CEE", "ECE", "IE", "MME", "MSE", "SE", "AISE", "BME"];

  function extract(text: string, extraValidKeys: string[] = []) {
    const validKeys = new Set([
      "NMM1411",
      "NMM1412",
      "NMM1414",
      "NMM2270",
      "NMM2276",
      "NMM2277",
      "ES1021",
      "ES1022",
      "ES1036",
      "ES1050",
      "CHEM1302",
      "PHYS1401",
      "PHYS1402",
      "CBE2220",
      "CBE2221",
      "CBE2224",
      "CBE2290",
      "CBE3315",
      "CEE2202",
      "CEE2221",
      "ECE2205",
      "ECE2233",
      "ECE2236",
      "ECE3332",
      "ECE3333",
      "IE2298",
      "IE2299",
      "MME2202",
      "MME3380",
      "MSE2202",
      "MSE3302",
      "MSE3310",
      "SE2203",
      "SE2205",
      "SE3309",
      "AISE2205",
      "AISE2251",
      "BME3201",
      ...extraValidKeys,
    ]);
    return extractPrereqCanonicalKeys(text, prefixes, validKeys);
  }

  it("matches plain short-prefix course codes", () => {
    expect(extract("CBE 2220A/B; CBE 2221A/B.")).toEqual(new Set(["CBE2220", "CBE2221"]));
  });

  it("resolves full department names to their real course-code prefix", () => {
    expect(extract("Engineering Science 1022A/B/Y; NMM 1412A/B.")).toEqual(
      new Set(["ES1022", "NMM1412"]),
    );
    expect(extract("Chemistry 1302A/B or the former Chemistry 1024A/B.")).toEqual(
      new Set(["CHEM1302"]),
    );
  });

  it("lets a bare number inherit the most recently seen prefix", () => {
    expect(
      extract("Physics 1401A/B or 1201A/B, Physics 1402A/B or 1202A/B.", ["PHYS1201", "PHYS1202"]),
    ).toEqual(new Set(["PHYS1401", "PHYS1201", "PHYS1402", "PHYS1202"]));
  });

  it("does not let a bare number inherit a prefix across a real course-code prefix reset", () => {
    // "NMM 2270A/B; ECE 2205A/B" -- the bare-number inheritance rule
    // must not somehow carry NMM over to the ECE token.
    expect(extract("NMM 2270A/B; ECE 2205A/B.")).toEqual(new Set(["NMM2270", "ECE2205"]));
  });

  it("strips 'the former X' mentions instead of resolving them", () => {
    expect(extract("NMM 1414A/B or the former Applied Mathematics 1414A/B.")).toEqual(
      new Set(["NMM1414"]),
    );
    expect(
      extract("AISE 3350A/B or the former ECE 3350A/B (pre-2024-25).", ["ECE3350"]),
    ).toEqual(new Set([])); // AISE3350 itself isn't in validKeys for this test, ECE3350 is former-stripped
  });

  it("excludes the corequisite portion of the text entirely", () => {
    expect(
      extract(
        "Engineering Science 1022A/B/Y; Physics 1401A/B. Corequisite: NMM 2270A/B.",
      ),
    ).toEqual(new Set(["ES1022", "PHYS1401"]));
  });

  it("ignores non-course admission/standing requirements (no digit-course-code pattern to match)", () => {
    expect(extract("Completion of third year of the Mechanical Engineering program.")).toEqual(new Set());
    expect(extract("Permission of instructor and a minimum cumulative grade average of 75%.")).toEqual(
      new Set(),
    );
    expect(extract("Registration in the Integrated Engineering program.")).toEqual(new Set());
    expect(extract("None.")).toEqual(new Set());
  });

  it("ignores references to courses outside the catalog (e.g. Computer Science, Biology, DS) even though they're real course-code shaped tokens", () => {
    expect(extract("Computer Science 1026A/B or Engineering Science 1036A/B.")).toEqual(
      new Set(["ES1036"]),
    );
    expect(extract("BME 3201A/B; Biology 1002B (or the former 1202B); Biochemistry 2280A.")).toEqual(
      new Set(["BME3201"]),
    );
    expect(extract("DS 3000A/B; AISE 3010A/B.")).toEqual(new Set([])); // neither DS3000 nor AISE3010 in this test's validKeys
  });

  it("handles a real complex multi-clause string end to end", () => {
    // MME 4452A/B's actual prerequisite text.
    expect(
      extract(
        "MME 3374A/B, MME 3380A/B, or ECE 3330A/B and ECE 3375A/B, or registration in fourth year of the Integrated Engineering program.",
        [],
      ),
    ).toEqual(new Set(["MME3380"])); // MME3374/ECE3330/ECE3375 aren't in this test's validKeys, MME3380 is
  });

  it("does not false-positive on a 4-digit year embedded in a parenthetical aside", () => {
    // "pre-2024-25" contains a 4-digit run right after an SE course code
    // reference. "SE 2205A/B" itself is a genuine alternative reference
    // and should match; "2024" (from "pre-2024-25") should not produce a
    // spurious "SE2024" match.
    expect(extract("AISE 2205A/B (or SE 2205A/B pre-2024-25); AISE 2251A/B (or the former SE 2251A/B).")).toEqual(
      new Set(["AISE2205", "SE2205", "AISE2251"]),
    );
  });
});

describe("buildPrereqGraph + selectDisciplineSubgraph", () => {
  const courses: PrereqCourseInput[] = [
    {
      id: "nmm1411",
      code: "NMM 1411A/B",
      title: "Linear Algebra",
      yearLevel: 1,
      prerequisites: "Ontario Secondary School MHF4U or MCV4U.",
      disciplineId: "d-first-year",
      disciplineName: "First Year (Common)",
      disciplineSlug: "first-year",
    },
    {
      id: "nmm1414",
      code: "NMM 1414B",
      title: "Calculus II",
      yearLevel: 1,
      prerequisites: "NMM 1412A/B, Calculus 1000A/B, Calculus 1500A/B, or the former Applied Mathematics 1412A/B.",
      disciplineId: "d-first-year",
      disciplineName: "First Year (Common)",
      disciplineSlug: "first-year",
    },
    {
      id: "cbe2220",
      code: "CBE 2220A/B",
      title: "Chemical Process Calculations",
      yearLevel: 2,
      prerequisites: "NMM 1411A/B, NMM 1414A/B, Chemistry 1302A/B, Physics 1401A/B or 1201A/B, Physics 1402A/B or 1202A/B.",
      disciplineId: "d-chemical",
      disciplineName: "Chemical Engineering",
      disciplineSlug: "chemical",
    },
    {
      id: "mme3380",
      code: "MME 3380A/B",
      title: "Mechanical Components Design",
      yearLevel: 3,
      prerequisites: "MME 2200Q/R/S/T or MSE 2200Q/R/S/T; MME 2202A/B or MSE 2212A/B; MME 3381A/B or MSE 3381A/B.",
      disciplineId: "d-mechanical",
      disciplineName: "Mechanical Engineering",
      disciplineSlug: "mechanical",
    },
    {
      id: "mse4499",
      code: "MSE 4499",
      title: "Mechatronic Design Project",
      yearLevel: 4,
      prerequisites: "MSE 3302A/B; MSE 3380A/B or MME 3380A/B.",
      disciplineId: "d-mechatronics",
      disciplineName: "Mechatronic Systems Engineering",
      disciplineSlug: "mechatronics",
    },
  ];

  it("only draws edges between courses that actually appear in the input catalog", () => {
    const { edges } = buildPrereqGraph(courses);
    // CBE 2220A/B cites NMM 1411A/B, NMM 1414A/B, Chemistry 1302A/B, and
    // Physics 1401/1201/1402/1202 -- only NMM 1411 and NMM 1414 exist in
    // this test's catalog, so only those two edges should appear.
    const intoCbe2220 = edges.filter((e) => e.toId === "cbe2220").map((e) => e.fromId).sort();
    expect(intoCbe2220).toEqual(["nmm1411", "nmm1414"]);
  });

  it("resolves a real cross-discipline dependency (Mechanical -> Mechatronics)", () => {
    const { edges } = buildPrereqGraph(courses);
    expect(edges).toContainEqual({ fromId: "mme3380", toId: "mse4499" });
  });

  it("never creates a self-referencing edge even if a course cites its own code", () => {
    const selfCiting: PrereqCourseInput[] = [
      {
        id: "x",
        code: "SE 4450",
        title: "Design II",
        yearLevel: 4,
        prerequisites: "SE 4450 lab placement.", // pathological input, shouldn't happen in real data
        disciplineId: "d",
        disciplineName: "Software Engineering",
        disciplineSlug: "software",
      },
    ];
    const { edges } = buildPrereqGraph(selfCiting);
    expect(edges).toHaveLength(0);
  });

  it("selectDisciplineSubgraph pulls in a direct external prerequisite but doesn't expand further upstream", () => {
    const graph = buildPrereqGraph(courses);
    const { nodeIds, edges } = selectDisciplineSubgraph(graph, "mechatronics");

    // MSE 4499 is in the discipline; its direct prerequisite MME 3380A/B
    // (Mechanical) should be pulled in even though it's a different
    // discipline...
    expect(nodeIds.has("mse4499")).toBe(true);
    expect(nodeIds.has("mme3380")).toBe(true);

    // ...but MME 3380A/B's own prerequisites are cross-discipline
    // Mechanical/Mechatronics course-code alternatives that aren't in
    // this small test catalog anyway, so nothing further should be
    // pulled in.
    expect(nodeIds.size).toBe(2);
    expect(edges).toEqual([{ fromId: "mme3380", toId: "mse4499" }]);
  });

  it("selectDisciplineSubgraph for first-year returns the within-discipline edge with no external nodes", () => {
    const graph = buildPrereqGraph(courses);
    const { nodeIds, edges } = selectDisciplineSubgraph(graph, "first-year");
    expect(nodeIds).toEqual(new Set(["nmm1411", "nmm1414"]));
    expect(edges).toEqual([]); // nmm1414's real prereq is NMM 1412, not NMM 1411 -- not present in this catalog
  });
});

describe("computeLayoutColumns", () => {
  it("puts a root node (no incoming edges) at column 0 and each dependent one column past its furthest prerequisite", () => {
    const nodeIds = new Set(["a", "b", "c", "d"]);
    // a -> b -> d, a -> c -> d  (d depends on both chains; the longer one, b, should win)
    const edges: GraphEdge[] = [
      { fromId: "a", toId: "b" },
      { fromId: "b", toId: "d" },
      { fromId: "a", toId: "c" },
      { fromId: "c", toId: "d" },
    ];
    const columns = computeLayoutColumns(nodeIds, edges);
    expect(columns.get("a")).toBe(0);
    expect(columns.get("b")).toBe(1);
    expect(columns.get("c")).toBe(1);
    expect(columns.get("d")).toBe(2);
  });

  it("puts two same-year courses that are direct prerequisites of each other in different columns (PHYS 1401 -> PHYS 1402 case)", () => {
    const nodeIds = new Set(["phys1401", "phys1402"]);
    const edges: GraphEdge[] = [{ fromId: "phys1401", toId: "phys1402" }];
    const columns = computeLayoutColumns(nodeIds, edges);
    expect(columns.get("phys1401")).toBe(0);
    expect(columns.get("phys1402")).toBe(1);
  });

  it("does not infinite-loop on a cycle, and still assigns every node a column", () => {
    const nodeIds = new Set(["x", "y"]);
    const edges: GraphEdge[] = [
      { fromId: "x", toId: "y" },
      { fromId: "y", toId: "x" }, // pathological -- shouldn't occur in real data
    ];
    const columns = computeLayoutColumns(nodeIds, edges);
    expect(columns.size).toBe(2);
    expect(Number.isFinite(columns.get("x"))).toBe(true);
    expect(Number.isFinite(columns.get("y"))).toBe(true);
  });

  it("ignores edges that reference a node outside the given nodeIds set", () => {
    const nodeIds = new Set(["a", "b"]);
    const edges: GraphEdge[] = [
      { fromId: "outside", toId: "b" },
      { fromId: "a", toId: "b" },
    ];
    const columns = computeLayoutColumns(nodeIds, edges);
    expect(columns.get("a")).toBe(0);
    expect(columns.get("b")).toBe(1);
  });
});
