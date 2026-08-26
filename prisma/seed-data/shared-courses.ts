import type { Term } from "../../app/generated/prisma/client";
import type { UpperYearCourse } from "./upper-year-courses";

/**
 * Courses required across most or all engineering disciplines (confirmed by
 * cross-referencing every discipline's official Progression Sheet -- these 8
 * codes turned up as a requirement on nearly every one), but not "owned" by
 * any single discipline the way e.g. MME 2202A/B belongs to Mechanical.
 *
 * Deliberately seeded with disciplineId left null rather than folded into
 * "first-year" (which specifically means Year 1) or forced into one
 * arbitrary owning discipline -- these are Year 2-4 courses shared across
 * many programs, and a null discipline is a more honest representation than
 * either alternative. They still surface correctly in each discipline's
 * /paths view via the existing cross-discipline prerequisite expansion
 * (selectDisciplineSubgraph in lib/prereq-graph.ts already pulls in a
 * prerequisite from outside the selected discipline), and still show up in
 * the default unfiltered /browse view -- they just won't match an active
 * discipline filter, which is accurate: they aren't "of" any one discipline.
 */
export const SHARED_COURSES: UpperYearCourse[] = [
  {
    code: "NMM 2270A/B",
    title: "Applied Mathematics for Engineering II",
    description: "First and higher order ODEs, initial and boundary value problems, mass-spring systems and RLC circuits, Laplace transforms, and Fourier series.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "NMM 1411A/B or the former Applied Mathematics 1411A/B, and NMM 1414A/B or the former Applied Mathematics 1414A/B or the former Applied Mathematics 1413.",
    antirequisites: "Applied Mathematics 2402A/B; the former NMM 2270A/B.",
  },
  {
    code: "NMM 2276A/B",
    title: "Applied Mathematics for Electrical and Mechanical Engineering III",
    description: "Orthogonal expansions, Fourier series and transforms, multiple integration, vector fields, line/surface/flux integrals, and the Green, Gauss, and Stokes theorems.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "NMM 2270A/B or the former Applied Mathematics 2270A/B.",
    antirequisites: "Calculus 2302A/B; Calculus 2303A/B; Mathematics 2500A/B; NMM 2277A/B; the former Applied Mathematics 2276A/B; the former Applied Mathematics 2277A/B; the former Calculus 2502A/B; the former Calculus 2503A/B.",
  },
  {
    code: "NMM 2277A/B",
    title: "Applied Mathematics for Chemical and Civil Engineering III",
    description: "Orthogonal expansions and Fourier series, partial differential equations, the wave/diffusion/Laplace equations, multiple integration, vector fields, and the Green, Gauss, and Stokes theorems.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "NMM 2270A/B or the former Applied Mathematics 2270A/B.",
    antirequisites: "Calculus 2302A/B; Calculus 2303A/B; Mathematics 2500A/B; NMM 2276A/B; the former Applied Mathematics 2276A/B; the former Applied Mathematics 2277A/B; the former Calculus 2502A/B; the former Calculus 2503A/B.",
  },
  {
    code: "NMM 3415A/B",
    title: "Advanced Applied Mathematics for Electrical Engineering",
    description: "Complex analysis and complex integration, boundary value problems, separation of variables, and Fourier series/transform methods for PDEs, applied to electrical engineering.",
    yearLevel: 3,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "NMM 2270A/B or the former Applied Mathematics 2270A/B, and NMM 2276A/B or the former Applied Mathematics 2276A/B.",
    antirequisites: "Applied Mathematics 3413A/B; Applied Mathematics 3815A/B; the former Applied Mathematics 3415A/B.",
  },
  {
    code: "SS 2141A/B",
    title: "Applied Probability and Statistics for Engineers",
    description: "An introduction to statistics emphasizing the applied probability models used in electrical and civil engineering -- samples, probability distributions, estimation, correlation, and regression.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "None.",
    antirequisites: "All other introductory statistics courses except Data Science 1000A/B, SS 1023A/B, or SS 1024A/B -- see the calendar for the full cross-faculty list.",
  },
  {
    code: "SS 2143A/B",
    title: "Applied Statistics and Data Analysis for Engineers",
    description: "A data-driven introduction to statistics for Chemical and Mechanical Engineering -- exploratory data analysis, probability distributions, estimation, correlation and regression, and design of experiments.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "None.",
    antirequisites: "All other introductory statistics courses except SS 1023A/B, Data Science 1000A/B, or SS 1024A/B -- see the calendar for the full cross-faculty list.",
  },
  {
    code: "Writ 2130F/G",
    title: "Building Better (Communication) Bridges: Rhetoric & Professional Communication for Engineers",
    description: "Rhetorical principles and the practice of written, oral, and visual communication in professional engineering contexts, including drafting, designing, editing, and revising technical documents.",
    yearLevel: 2,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "ES 1050.",
    antirequisites: "The former Engineering Science 2211F/G.",
  },
  {
    code: "ELI 4110F/G",
    title: "The Ethical Engineer",
    description: "Analyzes the PEO Code of Ethics, legal principles, and leadership character, applied to real engineering cases and the ethics and sustainability of emerging technologies.",
    yearLevel: 4,
    termsOffered: ["FALL", "WINTER"] as Term[],
    isCore: true,
    prerequisites: "Completion of third year of any Engineering program, or registration in Year 3 Integrated Engineering.",
    antirequisites: "The former Engineering Science 4498F/G.",
  },
];
