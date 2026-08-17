/**
 * Name and review-text pools used to generate synthetic seed data. Every
 * professor and review produced from this file is fictional — Professor
 * rows get `isSeedData: true` and reviews are written to read as generic
 * course feedback, never naming or describing a real person.
 */

export const FIRST_NAMES = [
  "Alex", "Priya", "Marcus", "Yuki", "Fatima", "Owen", "Ines", "Daniel",
  "Chloe", "Rohan", "Sofia", "Liam", "Mei", "Noah", "Aisha", "Ethan",
  "Zara", "Lucas", "Nadia", "Jack", "Amara", "Felix", "Simone", "Theo",
  "Leila", "Gavin", "Renee", "Kofi", "Ivy", "Dimitri", "Hana", "Miles",
  "Tessa", "Arjun", "Freya", "Samuel", "Yara", "Connor", "Naomi", "Xavier",
] as const;

export const LAST_NAMES = [
  "Bennett", "Okafor", "Nakamura", "Petrova", "Singh", "Marchetti", "Kwan",
  "Fontaine", "Osei", "Lindqvist", "Herrera", "Costa", "Novak", "Dubois",
  "Rahman", "Voss", "Andrade", "Tanaka", "Belanger", "Adeyemi", "Kowalski",
  "Moreau", "Iyer", "Sundberg", "Reyes", "Haddad", "Larsen", "Chowdhury",
  "Whitfield", "Rossi", "Berger", "Nwosu", "Sato", "Kellerman", "Duarte",
] as const;

export const TITLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Teaching Professor",
  "Lecturer",
] as const;

/** Synthetic Fall/Winter offering hint isn't needed here — terms come from the course. */
export const REVIEW_OPENERS = [
  "Took this one",
  "Just finished this course",
  "Went through this last term",
  "This was one of the tougher courses in the program",
  "Honestly didn't expect much going in",
  "A lot of people warned me about this course",
  "This ended up being one of my favourites",
  "Wasn't sure what to expect from the course outline",
] as const;

export const WORKLOAD_COMMENTS = [
  "The weekly workload was manageable if you kept up with it.",
  "Assignments piled up fast, especially close to midterms.",
  "Labs took way longer than the time slot suggested.",
  "Readings were light but the problem sets were long.",
  "Group project ate most of the term's time.",
  "Weekly quizzes kept the pace steady but predictable.",
  "Most of the effort was front-loaded in the first half.",
  "Workload was heavier in the back half once the project kicked in.",
] as const;

export const DIFFICULTY_COMMENTS = [
  "Concepts built on each other quickly, so falling behind hurt.",
  "Content itself wasn't bad, but exams were harder than the practice problems.",
  "If you went to lectures and did the practice sets, it was fair.",
  "A pretty steep curve if you hadn't seen the material before.",
  "Straightforward once the notation clicked.",
  "The math prerequisite really matters here — brush up beforehand.",
  "Exams focused more on application than memorization, which I liked.",
  "Harder than the course number suggests.",
] as const;

export const PROFESSOR_COMMENTS = [
  "Lectures were clear and office hours were actually useful.",
  "Explanations moved fast — recording lectures helped a lot.",
  "Really approachable for questions, even outside office hours.",
  "Slides were dense but lecture walked through them well.",
  "Feedback on assignments came back slow, which made it hard to adjust.",
  "Made a genuinely dry topic pretty engaging.",
  "Expectations were clear from day one, which I appreciated.",
  "Marking felt inconsistent between TAs.",
] as const;

export const CLOSERS = [
  "Would recommend if you're at all interested in the topic.",
  "Take it if you can, but don't leave the project to the last week.",
  "Worth it for the discipline requirement, nothing more.",
  "Genuinely one of the better courses in the sequence.",
  "Fine course, just budget your time realistically.",
  "Solid foundation for the upper-year courses that build on it.",
  "Would take it again if I had to redo the year.",
  "Manageable as long as you don't fall behind on the labs.",
] as const;

export function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Composes a synthetic review body in the 30-2000 char range the schema requires. */
export function composeReviewBody(rand: () => number, hasProfessor: boolean): string {
  const parts = [
    `${pick(REVIEW_OPENERS, rand)}. ${pick(WORKLOAD_COMMENTS, rand)}`,
    pick(DIFFICULTY_COMMENTS, rand),
    hasProfessor ? pick(PROFESSOR_COMMENTS, rand) : null,
    pick(CLOSERS, rand),
  ].filter((p): p is string => Boolean(p));

  return parts.join(" ");
}

/** Small mulberry32 PRNG so seed data is reproducible across `pnpm db:reset` runs. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
