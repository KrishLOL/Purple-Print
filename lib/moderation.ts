/**
 * A lightweight wordlist + heuristic filter for auto-publish decisions.
 * This is intentionally a starting point, not a production-grade solution —
 * a real deployment should swap PROFANITY_WORDLIST for a maintained,
 * vetted package (e.g. `obscenity` or a hosted list) rather than a
 * hand-rolled array. No external API calls, per the brief.
 */

// Common English profanity, kept moderate/representative rather than an
// exhaustive slur database — see the note above.
const PROFANITY_WORDLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "piss",
  "slut",
  "whore",
  "retard",
  "faggot",
  "nigger",
  "spic",
  "chink",
];

// Terms that, combined with a professor's name, suggest a serious personal
// allegation rather than teaching feedback — these should always go to a
// human, regardless of the profanity filter.
const TRIGGER_TERMS = [
  "affair",
  "arrested",
  "assault",
  "cheat",
  "cheating",
  "creepy",
  "discriminat",
  "drunk",
  "fired",
  "harass",
  "hit on",
  "inappropriate",
  "lawsuit",
  "predator",
  "racist",
  "sexist",
  "sexual",
  "stalk",
  "sued",
  "sue",
];

export function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export type ModerationVerdict = {
  status: "PUBLISHED" | "PENDING";
  reasons: string[];
};

/**
 * Decides whether a new review can auto-publish or needs a human to look
 * at it first. Two ways in: a profanity/slur hit, or a professor's name
 * appearing alongside a misconduct-flavoured trigger term.
 */
export function screenReview(body: string, professorNames: string[]): ModerationVerdict {
  const reasons: string[] = [];

  const profanityHit = PROFANITY_WORDLIST.find((w) => containsWord(body, w));
  if (profanityHit) {
    reasons.push("possible profanity/slur");
  }

  const mentionsProfessor = professorNames.some((name) => name.trim().length > 0 && containsWord(body, name));
  const triggerHit = TRIGGER_TERMS.find((t) => containsWord(body, t));
  if (mentionsProfessor && triggerHit) {
    reasons.push(`names a professor alongside a flagged term ("${triggerHit}")`);
  }

  return reasons.length > 0
    ? { status: "PENDING", reasons }
    : { status: "PUBLISHED", reasons: [] };
}

/**
 * Used by the review wizard's "this mentions someone you didn't select"
 * warning. Returns the full name of the first professor (other than the
 * one excluded) whose first or last name appears in `body` as a whole
 * word -- e.g. a professor named "Tim" shouldn't match "sometimes".
 */
export function findMentionedOtherProfessor(
  body: string,
  professors: { id: string; firstName: string; lastName: string }[],
  opts: { excludeId?: string | null; excludeFullName?: string | null } = {},
): string | null {
  if (!body) return null;
  const excludeFullName = opts.excludeFullName?.trim().toLowerCase() || null;
  for (const p of professors) {
    if (opts.excludeId && p.id === opts.excludeId) continue;
    const fullName = `${p.firstName} ${p.lastName}`;
    // The name a student just typed under "Other" isn't a stray mention --
    // it's who the review is about -- so a coincidental match there
    // shouldn't trigger the warning.
    if (excludeFullName && fullName.toLowerCase() === excludeFullName) continue;
    if (containsWord(body, p.firstName) || containsWord(body, p.lastName)) {
      return fullName;
    }
  }
  return null;
}
