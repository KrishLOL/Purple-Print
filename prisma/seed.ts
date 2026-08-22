import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Term, type GradeBucket } from "../app/generated/prisma/client";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "../lib/ratings";
import { hashEmail } from "../lib/anonymize";
import { FIRST_YEAR_COURSES } from "./seed-data/first-year-courses";
import { UPPER_YEAR_COURSES } from "./seed-data/upper-year-courses";
import {
  FIRST_NAMES,
  LAST_NAMES,
  TITLES,
  composeReviewBody,
  mulberry32,
  pick,
} from "./seed-data/synthetic";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rand = mulberry32(42); // fixed seed: seed data is reproducible across `pnpm db:reset`

/**
 * 8 real Western Engineering programs + First Year (Common). "Computer
 * Engineering" is deliberately absent — it was discontinued as a standalone
 * Western degree in September 2022; its courses are folded into Electrical
 * Engineering below, since the ECE department now serves both.
 */
const DISCIPLINES = [
  {
    name: "First Year (Common)",
    slug: "first-year",
    code: "FYC",
    glyphKey: "compass",
    colorAccent: "#64748B",
    blurb: "Every Western Engineering student's first two terms, shared across all eight disciplines.",
  },
  {
    name: "Chemical Engineering",
    slug: "chemical",
    code: "CHE",
    glyphKey: "beaker",
    colorAccent: "#14B8A6",
    blurb: "Processes, reactions, and the plants that scale them up.",
  },
  {
    name: "Civil Engineering",
    slug: "civil",
    code: "CIV",
    glyphKey: "truss",
    colorAccent: "#EA580C",
    blurb: "Structures, infrastructure, and the built environment.",
  },
  {
    name: "Electrical Engineering",
    slug: "electrical",
    code: "ELE",
    glyphKey: "wave",
    colorAccent: "#EAB308",
    blurb: "Power, signals, and the digital systems now built on top of them.",
  },
  {
    name: "Green Process Engineering",
    slug: "green-process",
    code: "GPE",
    glyphKey: "leaf",
    colorAccent: "#16A34A",
    blurb: "Chemical engineering pointed at sustainability from day one.",
  },
  {
    name: "Integrated Engineering",
    slug: "integrated",
    code: "INT",
    glyphKey: "node-graph",
    colorAccent: "#818CF8",
    blurb: "One degree across mechanical, electrical, and software systems.",
  },
  {
    name: "Mechanical Engineering",
    slug: "mechanical",
    code: "MEC",
    glyphKey: "gear",
    colorAccent: "#F472B6",
    blurb: "Forces, materials, and machines that have to actually move.",
  },
  {
    name: "Mechatronic Systems Engineering",
    slug: "mechatronics",
    code: "MSE",
    glyphKey: "chip",
    colorAccent: "#60A5FA",
    blurb: "Mechanical, electrical, and control systems, wired together.",
  },
  {
    name: "Software Engineering",
    slug: "software",
    code: "SWE",
    glyphKey: "bracket",
    colorAccent: "#C084FC",
    blurb: "Systems, not scripts — engineering discipline applied to code.",
  },
];

const GRADE_WEIGHTS: Array<[GradeBucket, number]> = [
  ["A", 0.32],
  ["B", 0.3],
  ["C", 0.14],
  ["D", 0.05],
  ["F", 0.03],
  ["PREFER_NOT_TO_SAY", 0.16],
];

function weightedPick<T>(weights: Array<[T, number]>): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [value, weight] of weights) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return weights[weights.length - 1][0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomPastDate(monthsBack: number): Date {
  const now = Date.now();
  const past = now - randomInt(0, monthsBack * 30) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

async function seedDisciplines() {
  for (const discipline of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { slug: discipline.slug },
      update: discipline,
      create: discipline,
    });
  }
  console.log(`Seeded ${DISCIPLINES.length} disciplines.`);
}

async function seedCourses() {
  const firstYear = await prisma.discipline.findUniqueOrThrow({ where: { slug: "first-year" } });

  for (const course of FIRST_YEAR_COURSES) {
    const data = {
      title: course.title,
      description: course.description,
      disciplineId: firstYear.id,
      yearLevel: 1,
      termsOffered: course.termsOffered,
      isCore: true,
      isFirstYearCommon: true,
      antirequisites: course.antirequisites,
      prerequisites: course.prerequisites,
    };
    await prisma.course.upsert({
      where: { code: course.code },
      update: data,
      create: { code: course.code, isSeedData: true, ...data },
    });
  }

  let upperYearCount = 0;
  for (const [slug, courses] of Object.entries(UPPER_YEAR_COURSES)) {
    const discipline = await prisma.discipline.findUniqueOrThrow({ where: { slug } });
    for (const course of courses) {
      const data = {
        title: course.title,
        description: course.description,
        disciplineId: discipline.id,
        yearLevel: course.yearLevel,
        termsOffered: course.termsOffered,
        isCore: course.isCore,
        isFirstYearCommon: false,
        antirequisites: course.antirequisites,
        prerequisites: course.prerequisites,
      };
      await prisma.course.upsert({
        where: { code: course.code },
        update: data,
        create: { code: course.code, isSeedData: true, ...data },
      });
      upperYearCount++;
    }
  }

  console.log(`Seeded ${FIRST_YEAR_COURSES.length} first-year + ${upperYearCount} upper-year courses.`);
}

async function seedProfessors() {
  const disciplines = await prisma.discipline.findMany();
  const usedNames = new Set<string>();
  const professorCount = 40;

  for (let i = 0; i < professorCount; i++) {
    let firstName: string;
    let lastName: string;
    let nameKey: string;
    do {
      firstName = pick(FIRST_NAMES, rand);
      lastName = pick(LAST_NAMES, rand);
      nameKey = `${firstName}-${lastName}`;
    } while (usedNames.has(nameKey));
    usedNames.add(nameKey);

    const discipline = disciplines[i % disciplines.length];
    const slug = `${nameKey.toLowerCase()}`;

    await prisma.professor.upsert({
      where: { slug },
      update: {},
      create: {
        firstName,
        lastName,
        slug,
        title: pick(TITLES, rand),
        profileUrl: null,
        disciplineId: discipline.id,
        isSeedData: true,
      },
    });
  }

  console.log(`Seeded ${professorCount} professors.`);
}

async function linkCourseProfessors() {
  const courses = await prisma.course.findMany({ where: { isSeedData: true } });
  const professors = await prisma.professor.findMany({ where: { isSeedData: true } });
  const terms = ["Fall 2024", "Winter 2025", "Fall 2025", "Winter 2026"];

  let links = 0;
  for (const course of courses) {
    const pool = professors.filter((p) => p.disciplineId === course.disciplineId);
    if (pool.length === 0) continue;

    const teachCount = Math.min(pool.length, randomInt(1, 2));
    const chosen = new Set<string>();
    while (chosen.size < teachCount) {
      chosen.add(pick(pool, rand).id);
    }

    for (const professorId of chosen) {
      await prisma.courseProfessor.upsert({
        where: { courseId_professorId: { courseId: course.id, professorId } },
        update: {},
        create: { courseId: course.id, professorId, lastTaughtTerm: pick(terms, rand) },
      });
      links++;
    }
  }

  console.log(`Linked ${links} course-professor pairs.`);
}

async function seedUsers() {
  const disciplines = await prisma.discipline.findMany();
  const userCount = 110;
  const usedEmails = new Set<string>();

  for (let i = 0; i < userCount; i++) {
    const firstName = pick(FIRST_NAMES, rand);
    const lastName = pick(LAST_NAMES, rand);
    let email: string;
    do {
      email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 999)}@uwo.ca`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const emailHash = hashEmail(email);

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        emailHash,
        emailDomain: "uwo.ca",
        disciplineId: pick(disciplines, rand).id,
        gradYear: randomInt(2024, 2029),
        role: "STUDENT",
        isBanned: false,
        isSeedData: true,
      },
    });
  }

  console.log(`Seeded ${userCount} synthetic student users.`);
}

/**
 * How many reviews each course gets. ES 1036A/B (the most-taken, most
 * relatable first-year course) gets 40 to demonstrate the Bayesian ranking
 * holding up against a large sample; the rest of first-year gets a solid
 * base (highest-traffic pages, per the brief); upper-year courses get a
 * sparse, randomized spread so most show "Not enough ratings" and a few
 * cross the 3-review threshold — matching real usage.
 */
function buildReviewPlan(): Array<{ code: string; count: number }> {
  const plan: Array<{ code: string; count: number }> = [{ code: "ES 1036A/B", count: 40 }];

  const otherFirstYear = FIRST_YEAR_COURSES.filter((c) => c.code !== "ES 1036A/B");
  const fyCounts = [8, 7, 6, 5, 7, 6, 5, 4, 6, 6]; // sums to 60
  otherFirstYear.forEach((c, i) => plan.push({ code: c.code, count: fyCounts[i] }));

  const allUpperYear = Object.values(UPPER_YEAR_COURSES).flat();
  const shuffled = [...allUpperYear].sort(() => rand() - 0.5);
  const numChosen = 22;
  const chosen = shuffled.slice(0, numChosen);

  const remaining = 150 - 40 - 60; // 50
  const counts = chosen.map(() => 1);
  let leftover = remaining - counts.length;
  while (leftover > 0) {
    counts[Math.floor(rand() * counts.length)]++;
    leftover--;
  }
  chosen.forEach((c, i) => plan.push({ code: c.code, count: counts[i] }));

  return plan;
}

async function seedReviews() {
  const plan = buildReviewPlan();
  const users = await prisma.user.findMany({ where: { isSeedData: true } });
  const usedPairs = new Set<string>();
  const touchedCourseIds = new Set<string>();
  const touchedProfessorIds = new Set<string>();

  let reviewIndex = 0;
  const totalReviews = plan.reduce((sum, p) => sum + p.count, 0);

  for (const { code, count } of plan) {
    const course = await prisma.course.findUniqueOrThrow({ where: { code } });
    const courseProfessors = await prisma.courseProfessor.findMany({
      where: { courseId: course.id },
      include: { professor: true },
    });
    touchedCourseIds.add(course.id);

    for (let i = 0; i < count; i++) {
      let user: (typeof users)[number];
      let pairKey: string;
      do {
        user = pick(users, rand);
        pairKey = `${user.id}:${course.id}`;
      } while (usedPairs.has(pairKey));
      usedPairs.add(pairKey);

      const hasProfessor = courseProfessors.length > 0 && rand() > 0.15;
      const professor = hasProfessor ? pick(courseProfessors, rand).professor : null;
      if (professor) touchedProfessorIds.add(professor.id);

      const useful = randomInt(2, 5);
      const easy = randomInt(1, 5);
      const likedProbability = useful >= 4 ? 0.85 : useful === 3 ? 0.5 : 0.2;
      const liked = rand() < likedProbability;

      const term: Term =
        course.termsOffered.length > 0 ? pick(course.termsOffered, rand) : "FALL";

      reviewIndex++;
      const status = reviewIndex <= 3 ? "PENDING" : reviewIndex <= 5 ? "REMOVED" : "PUBLISHED";

      await prisma.review.create({
        data: {
          userId: user.id,
          courseId: course.id,
          professorId: professor?.id ?? null,
          termTaken: term,
          yearTaken: randomInt(2023, 2026),
          useful,
          easy,
          liked,
          workloadHours: randomInt(3, 16),
          clarity: professor ? randomInt(2, 5) : null,
          helpfulness: professor ? randomInt(2, 5) : null,
          wouldRetake: professor ? rand() < 0.7 : null,
          gradeReceived: weightedPick(GRADE_WEIGHTS),
          body: composeReviewBody(rand, Boolean(professor)),
          status,
          isSeedData: true,
          createdAt: randomPastDate(18),
        },
      });
    }
  }

  console.log(`Seeded ${totalReviews} reviews across ${plan.length} courses.`);
  return { touchedCourseIds, touchedProfessorIds };
}

async function recomputeAggregates(courseIds: Set<string>, professorIds: Set<string>) {
  for (const courseId of courseIds) {
    await recomputeCourseAggregates(prisma, courseId);
  }
  for (const professorId of professorIds) {
    await recomputeProfessorAggregates(prisma, professorId);
  }
  console.log(
    `Recomputed aggregates for ${courseIds.size} courses and ${professorIds.size} professors.`,
  );
}

async function main() {
  await seedDisciplines();
  await seedCourses();
  await seedProfessors();
  await linkCourseProfessors();
  await seedUsers();
  const { touchedCourseIds, touchedProfessorIds } = await seedReviews();
  await recomputeAggregates(touchedCourseIds, touchedProfessorIds);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
