import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

/**
 * Milestone 1 stub: seeds the 10 disciplines only, so /styleguide and early
 * pages have real rows to point at. Courses, professors, and reviews are
 * added in milestone 2 (see prisma/seed.ts TODOs below and prisma/seed-data/).
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DISCIPLINES = [
  {
    name: "First Year (Common)",
    slug: "first-year",
    code: "FYC",
    glyphKey: "compass",
    colorAccent: "#64748B",
    blurb: "Every Western Engineering student's first two terms, shared across all nine disciplines.",
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
    name: "Computer Engineering",
    slug: "computer",
    code: "CPE",
    glyphKey: "circuit",
    colorAccent: "#22D3EE",
    blurb: "Hardware and the software that has to know it's there.",
  },
  {
    name: "Electrical Engineering",
    slug: "electrical",
    code: "ELE",
    glyphKey: "wave",
    colorAccent: "#EAB308",
    blurb: "Power, signals, and everything that moves through a wire.",
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

async function main() {
  for (const discipline of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { slug: discipline.slug },
      update: discipline,
      create: discipline,
    });
  }
  console.log(`Seeded ${DISCIPLINES.length} disciplines.`);

  // TODO (milestone 2): seed first-year common courses, 8-12 courses per
  // discipline, ~40 professors (isSeedData: true), and 150 synthetic
  // reviews, then recompute aggregates via lib/ratings.ts.
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
