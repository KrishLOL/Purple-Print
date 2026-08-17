import type { Term } from "../../app/generated/prisma/client";

/**
 * The 11 first-year common courses every Western Engineering student takes,
 * regardless of discipline. Codes/titles are taken directly from the brief
 * and match the Western Academic Calendar (westerncalendar.uwo.ca).
 * Term suffixes: A = Fall, B = Winter, Y/E = full year (Fall + Winter).
 */
export const FIRST_YEAR_COURSES: Array<{
  code: string;
  title: string;
  description: string;
  termsOffered: Term[];
}> = [
  {
    code: "NMM 1411A/B",
    title: "Linear Algebra with Numerical Analysis for Engineers",
    description: "Vectors, matrices, and linear systems, with an introduction to the numerical methods engineers use to solve them.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "NMM 1412A",
    title: "Calculus for Engineers I",
    description: "Differential and integral calculus of one variable, built around engineering applications.",
    termsOffered: ["FALL"],
  },
  {
    code: "NMM 1414B",
    title: "Calculus for Engineers II",
    description: "Multivariable calculus, sequences and series, and differential equations for engineering problems.",
    termsOffered: ["WINTER"],
  },
  {
    code: "BUS 1299E",
    title: "Business for Engineers",
    description: "Accounting, finance, and management fundamentals aimed at engineers who'll end up managing budgets and teams.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "CHEM 1302A/B",
    title: "Chemistry for Engineers",
    description: "General chemistry — reactions, materials, and thermodynamics — framed around engineering practice.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "ES 1021A/B",
    title: "Properties of Materials in Engineering",
    description: "How the mechanical, thermal, and electrical properties of materials drive engineering design choices.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "ES 1022Y",
    title: "Engineering Statics",
    description: "Forces, moments, and equilibrium in structures and machines — the foundation for every mechanics course after it.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "ES 1036A/B",
    title: "Programming Fundamentals for Engineers",
    description: "An intro to programming and problem-solving for engineers, with no assumed prior coding experience.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "ES 1050",
    title: "Foundations of Engineering Practice",
    description: "Design process, teamwork, ethics, and communication — the non-technical skills that show up in every other course.",
    termsOffered: ["FALL"],
  },
  {
    code: "PHYS 1401A/B",
    title: "Physics for Engineering Students I",
    description: "Mechanics and waves, taught with the calculus and problem-solving habits engineering builds on later.",
    termsOffered: ["FALL", "WINTER"],
  },
  {
    code: "PHYS 1402A/B",
    title: "Physics for Engineering Students II",
    description: "Electricity, magnetism, and modern physics, continuing from Physics for Engineering Students I.",
    termsOffered: ["FALL", "WINTER"],
  },
];
