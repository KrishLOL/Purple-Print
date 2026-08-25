import type { Term } from "../../app/generated/prisma/client";

/**
 * The 11 first-year common courses every Western Engineering student takes,
 * regardless of discipline. Codes/titles match the Western Academic Calendar
 * (westerncalendar.uwo.ca). Prerequisites/antirequisites are sourced
 * verbatim from the live calendar as of 2026-08.
 */
export const FIRST_YEAR_COURSES: Array<{
  code: string;
  title: string;
  description: string;
  termsOffered: Term[];
  prerequisites: string;
  antirequisites: string;
  summerEquivalentNote?: string;
}> = [
  {
    code: "NMM 1411A/B",
    title: "Linear Algebra with Numerical Analysis for Engineers",
    description: "Vectors, matrices, and linear systems, with an introduction to the numerical methods engineers use to solve them.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "Ontario Secondary School MHF4U or MCV4U, or Mathematics 0110A/B.",
    antirequisites: "Mathematics 1600A/B; the former Applied Mathematics 1411A/B.",
    // Confirmed on Western's Summer Academic Timetable: no NMM section runs
    // in Summer, but Mathematics 1600A/B -- its own listed antirequisite,
    // i.e. the calendar already treats it as covering the same material --
    // does (as MATH 1600A).
    summerEquivalentNote: "Not offered directly in Summer, but Mathematics 1600A/B (Linear Algebra I) — its own listed antirequisite — runs then and is accepted as equivalent.",
  },
  {
    code: "NMM 1412A",
    title: "Calculus for Engineers I",
    description: "Differential and integral calculus of one variable, built around engineering applications.",
    termsOffered: ["FALL"],
    prerequisites: "Ontario Secondary School MCV4U or equivalent, or Mathematics 0110A/B.",
    antirequisites: "Calculus 1000A/B; Calculus 1500A/B; Mathematics 1225A/B; Mathematics 1230A/B.",
    // Same reasoning as NMM 1411A/B -- Calculus 1000A/B and Mathematics
    // 1225A/B, both listed antirequisites, are confirmed running in Summer
    // (as CALCULUS 1000A and MATH 1225A).
    summerEquivalentNote: "Not offered directly in Summer, but Calculus 1000A/B or Mathematics 1225A/B — both listed antirequisites — run then and are accepted as equivalents.",
  },
  {
    code: "NMM 1414B",
    title: "Calculus for Engineers II",
    description: "Multivariable calculus, sequences and series, and differential equations for engineering problems.",
    // Also runs as NMM 1414A in Summer -- the same course under a different
    // session letter, confirmed on Western's Summer Academic Timetable.
    termsOffered: ["WINTER", "SUMMER"],
    prerequisites: "NMM 1412A/B, Calculus 1000A/B, Calculus 1500A/B, or the former Applied Mathematics 1412A/B.",
    antirequisites: "Calculus 1301A/B; Calculus 1501A/B; the former Applied Mathematics 1413; the former Applied Mathematics 1414A/B.",
    summerEquivalentNote: "Calculus 1301A/B and Calculus 1501A/B — both listed antirequisites — also run in Summer, if NMM 1414A doesn't fit your schedule.",
  },
  {
    code: "BUS 1299E",
    title: "Business for Engineers",
    description: "Accounting, finance, and management fundamentals aimed at engineers who'll end up managing budgets and teams.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "None.",
    antirequisites: "Business Administration 1220E or the former Business Administration 1220; Business Administration 2295F/G; Business Administration 2299E.",
  },
  {
    code: "CHEM 1302A/B",
    title: "Chemistry for Engineers",
    description: "General chemistry — reactions, materials, and thermodynamics — framed around engineering practice.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "Grade 12U Chemistry (SCH4U) or equivalent. Grade 12U Advanced Functions (MHF4U) or Calculus & Vectors (MCV4U), or Mathematics 0110A/B or 0105A/B, is strongly recommended.",
    antirequisites: "Ontario High School SCH4U or equivalent; Chemistry 0010; any university-level Chemistry course.",
  },
  {
    code: "ES 1021A/B",
    title: "Properties of Materials in Engineering",
    description: "How the mechanical, thermal, and electrical properties of materials drive engineering design choices.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "None.",
    antirequisites: "None.",
  },
  {
    code: "ES 1022Y",
    title: "Engineering Statics",
    description: "Forces, moments, and equilibrium in structures and machines — the foundation for every mechanics course after it.",
    // Also runs as a compressed section in Summer (confirmed on Western's
    // official Summer Academic Timetable as ENGSCI 1022A) alongside its
    // normal Fall/Winter offering.
    termsOffered: ["FALL", "WINTER", "SUMMER"],
    prerequisites: "None.",
    antirequisites: "None.",
  },
  {
    code: "ES 1036A/B",
    title: "Programming Fundamentals for Engineers",
    description: "An intro to programming and problem-solving for engineers, with no assumed prior coding experience.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "None.",
    antirequisites: "Computer Science 1025A/B; Computer Science 1026A/B.",
  },
  {
    code: "ES 1050",
    title: "Foundations of Engineering Practice",
    description: "Design process, teamwork, ethics, and communication — the non-technical skills that show up in every other course.",
    termsOffered: ["FALL"],
    prerequisites: "None.",
    antirequisites: "None.",
  },
  {
    code: "PHYS 1401A/B",
    title: "Physics for Engineering Students I",
    description: "Mechanics and waves, taught with the calculus and problem-solving habits engineering builds on later.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "Grade 12U Calculus and Vectors (MCV4U) or Mathematics 0110A/B; Grade 12U Physics (SPH4U). Corequisite: NMM 1412A/B (preferred) or Calculus 1000A/B or Calculus 1500A/B or the former Applied Mathematics 1412A/B.",
    antirequisites: "Physics 1021; Physics 1101A/B; Physics 1201A/B; Physics 1501A/B; the former Physics 1028A/B; the former Physics 1301A/B.",
  },
  {
    code: "PHYS 1402A/B",
    title: "Physics for Engineering Students II",
    description: "Electricity, magnetism, and modern physics, continuing from Physics for Engineering Students I.",
    termsOffered: ["FALL", "WINTER"],
    prerequisites: "Physics 1401A/B or Physics 1501A/B; NMM 1412A/B (preferred) or Calculus 1000A/B or Calculus 1500A/B or the former Applied Mathematics 1412A/B, or permission of the department.",
    antirequisites: "Physics 1021; Physics 1102A/B; Physics 1202A/B; Physics 1502A/B; the former Physics 1029A/B; the former Physics 1302A/B.",
  },
];
