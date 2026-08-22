/**
 * Parses free-text prerequisite strings (sourced verbatim from Western's
 * academic calendar — see prisma/seed-data/) into a directed graph of
 * course-to-course dependencies.
 *
 * This is deliberately conservative: it only ever draws an edge when it
 * can match a specific course code that actually exists in the catalog
 * passed in. Anything it can't confidently resolve — grade-school
 * prerequisites, non-course admission requirements ("permission of the
 * instructor"), courses outside the catalog (Computer Science, Biology,
 * DS, ...), or corequisites (a same-term requirement, not a "before"
 * dependency) — is simply left out of the graph rather than guessed at.
 * The raw prerequisite text is always available alongside the graph (see
 * CourseNode.prerequisites) so nothing is ever hidden or misrepresented,
 * only supplemented.
 *
 * It also does not attempt to reconstruct AND/OR boolean structure from
 * the prose (which is often genuinely ambiguous — e.g. a comma sometimes
 * separates alternatives, sometimes separates required-together clauses).
 * An edge means "this course is referenced as a requirement", not "this
 * exact course is strictly required" — the real logic is in the raw text.
 */

export type PrereqCourseInput = {
  id: string;
  code: string;
  title: string;
  yearLevel: number;
  prerequisites: string | null;
  disciplineId: string | null;
  disciplineName: string | null;
  disciplineSlug: string | null;
};

export type GraphNode = {
  id: string;
  code: string;
  title: string;
  yearLevel: number;
  disciplineSlug: string | null;
  disciplineName: string | null;
  prerequisitesText: string | null;
};

export type GraphEdge = { fromId: string; toId: string };

export type PrereqGraph = { nodes: Map<string, GraphNode>; edges: GraphEdge[] };

/** Full department names that show up in prerequisite prose instead of the short course-code prefix actually used in our catalog. */
const FULL_NAME_ALIASES: Record<string, string> = {
  "engineering science": "ES",
  chemistry: "CHEM",
  physics: "PHYS",
  "integrated engineering": "IE",
};

/** Reduces a course code like "ES 1022Y" or "NMM 1414A/B" to a canonical "ES1022" / "NMM1414" key, dropping section-letter suffixes so different section formats of the same course always match. */
export function canonicalKey(code: string): string {
  const m = code.trim().match(/^([A-Za-z]+)\D*(\d{3,4})/);
  if (!m) return code.toUpperCase().replace(/\s+/g, "");
  return `${m[1].toUpperCase()}${m[2]}`;
}

/** Drops "the former X ####" / "Former X ####" mentions — a superseded course code shouldn't create an edge to a course that no longer exists under that name. */
function stripFormerMentions(text: string): string {
  return text.replace(/\bthe former\s+(?:[A-Za-z]+(?:\s+[A-Za-z]+)*\s+)?\d{3,4}[A-Za-z/]*\.?/gi, " ");
}

/** Keeps only the prerequisite portion of the text — a corequisite is a same-term requirement, not a "must complete before" dependency, so it's excluded from the graph entirely rather than drawn as if it were one. */
function stripCorequisitePortion(text: string): string {
  return text.split(/corequisite/i)[0];
}

/**
 * Scans prerequisite text for course-code references, resolving full
 * department names via FULL_NAME_ALIASES and letting a bare number
 * (e.g. "...or 1201A/B") inherit the most recently seen prefix in the
 * same string. Only returns canonical keys present in `validKeys`.
 */
export function extractPrereqCanonicalKeys(
  rawText: string,
  knownPrefixes: readonly string[],
  validKeys: ReadonlySet<string>,
): Set<string> {
  const text = stripFormerMentions(stripCorequisitePortion(rawText));

  const aliasNames = Object.keys(FULL_NAME_ALIASES);
  const allPrefixTokens = [...aliasNames, ...knownPrefixes].sort((a, b) => b.length - a.length);
  if (allPrefixTokens.length === 0) return new Set();

  const prefixPattern = allPrefixTokens.map((p) => p.replace(/\s+/g, "\\s+")).join("|");
  const tokenRe = new RegExp(`(?:\\b(${prefixPattern})\\s+)?\\b(\\d{4})([A-Za-z/]*)`, "gi");

  const found = new Set<string>();
  let lastPrefix: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(text))) {
    const rawPrefix = match[1];
    const num = match[2];

    let prefix: string;
    if (rawPrefix) {
      const key = rawPrefix.toLowerCase().replace(/\s+/g, " ").trim();
      prefix = FULL_NAME_ALIASES[key] ?? rawPrefix.toUpperCase();
      lastPrefix = prefix;
    } else if (lastPrefix) {
      prefix = lastPrefix;
    } else {
      continue;
    }

    const candidate = `${prefix}${num}`;
    if (validKeys.has(candidate)) found.add(candidate);
  }
  return found;
}

/** Builds a directed prerequisite graph across every course passed in — always run this over the full catalog, then filter the returned nodes/edges for display, so cross-discipline prerequisites are never silently dropped. */
export function buildPrereqGraph(courses: PrereqCourseInput[]): PrereqGraph {
  const nodes = new Map<string, GraphNode>();
  const keyToId = new Map<string, string>();
  const knownPrefixSet = new Set<string>();

  for (const course of courses) {
    nodes.set(course.id, {
      id: course.id,
      code: course.code,
      title: course.title,
      yearLevel: course.yearLevel,
      disciplineSlug: course.disciplineSlug,
      disciplineName: course.disciplineName,
      prerequisitesText: course.prerequisites,
    });
    const key = canonicalKey(course.code);
    keyToId.set(key, course.id);
    const prefixMatch = course.code.match(/^[A-Za-z]+/);
    if (prefixMatch) knownPrefixSet.add(prefixMatch[0].toUpperCase());
  }

  const knownPrefixes = [...knownPrefixSet];
  const validKeys = new Set(keyToId.keys());
  const edges: GraphEdge[] = [];

  for (const course of courses) {
    if (!course.prerequisites) continue;
    const refs = extractPrereqCanonicalKeys(course.prerequisites, knownPrefixes, validKeys);
    for (const ref of refs) {
      const fromId = keyToId.get(ref);
      if (!fromId || fromId === course.id) continue;
      edges.push({ fromId, toId: course.id });
    }
  }

  return { nodes, edges };
}

/**
 * Given a full graph and a chosen discipline slug, returns the node ids
 * to display: every course in that discipline, plus any course from a
 * *different* discipline that's a direct prerequisite of one of them (so
 * a real cross-discipline dependency — e.g. a Mechanical course feeding
 * into a Mechatronics one — is shown rather than cut off at the
 * discipline boundary). Ancestors of ancestors outside the discipline
 * aren't expanded further, to keep the graph focused.
 */
export function selectDisciplineSubgraph(
  graph: PrereqGraph,
  disciplineSlug: string,
): { nodeIds: Set<string>; edges: GraphEdge[] } {
  const inDiscipline = new Set<string>();
  for (const node of graph.nodes.values()) {
    if (node.disciplineSlug === disciplineSlug) inDiscipline.add(node.id);
  }

  const nodeIds = new Set(inDiscipline);
  for (const edge of graph.edges) {
    if (inDiscipline.has(edge.toId)) nodeIds.add(edge.fromId);
  }

  const edges = graph.edges.filter((e) => nodeIds.has(e.fromId) && nodeIds.has(e.toId));
  return { nodeIds, edges };
}

/**
 * Assigns each node a left-to-right layout column via longest-path-from-
 * a-root layering, so every edge in the rendered diagram always points
 * strictly left-to-right. This deliberately does NOT use Course.yearLevel
 * for column position — two courses in the same year can still be a
 * direct prerequisite of each other (e.g. PHYS 1401A/B -> PHYS 1402A/B,
 * both Year 1), which would otherwise create a same-column edge with
 * nowhere sensible to route it.
 *
 * Guards against cycles (which a real prerequisite graph shouldn't have,
 * but a parsing edge case creating one would otherwise infinite-loop)
 * by tracking the current recursion stack and treating a revisited
 * in-progress node as column 0 rather than recursing forever.
 */
export function computeLayoutColumns(nodeIds: ReadonlySet<string>, edges: readonly GraphEdge[]): Map<string, number> {
  const incoming = new Map<string, string[]>();
  for (const id of nodeIds) incoming.set(id, []);
  for (const edge of edges) {
    if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) continue;
    incoming.get(edge.toId)!.push(edge.fromId);
  }

  const columns = new Map<string, number>();
  const inProgress = new Set<string>();

  function resolve(id: string): number {
    const cached = columns.get(id);
    if (cached !== undefined) return cached;
    if (inProgress.has(id)) return 0; // cycle guard
    inProgress.add(id);

    const sources = incoming.get(id) ?? [];
    const column = sources.length === 0 ? 0 : 1 + Math.max(...sources.map(resolve));

    inProgress.delete(id);
    columns.set(id, column);
    return column;
  }

  for (const id of nodeIds) resolve(id);
  return columns;
}
