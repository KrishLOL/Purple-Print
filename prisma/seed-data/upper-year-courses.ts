import type { Term } from "../../app/generated/prisma/client";

export type UpperYearCourse = {
  code: string;
  title: string;
  description: string;
  yearLevel: number;
  termsOffered: Term[];
  isCore: boolean;
};

/**
 * Real, verified upper-year courses per discipline, sourced from the
 * Western Academic Calendar (westerncalendar.uwo.ca) and eng.uwo.ca
 * department pages. Ratings/reviews are synthetic — course codes and
 * titles are not.
 *
 * Two corrections from the original program list, confirmed against the
 * live calendar:
 * - "Computer Engineering" was discontinued as a standalone Western degree
 *   in September 2022. Its courses are folded into Electrical Engineering
 *   below (ECE now serves both) rather than seeded as a separate program.
 * - Integrated Engineering's upper-year prefix is `IE`, not `ES` — `ES` is
 *   only used for the four first-year common courses.
 *
 * Green Process Engineering and Integrated Engineering have fewer
 * dedicated courses than the other disciplines (5 and 11 respectively) —
 * that's a real, small-catalogue program, not a seeding shortcut. GPE
 * students also take several CBE courses in practice, but those are
 * already seeded once under Chemical Engineering (Course.code is unique
 * per course, not per discipline) rather than duplicated here.
 */
export const UPPER_YEAR_COURSES: Record<string, UpperYearCourse[]> = {
  chemical: [
    { code: "CBE 2220A/B", title: "Chemical Process Calculations", description: "Material and energy balances that underpin every later chemical engineering course.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 2221A/B", title: "Fluid Flow", description: "Momentum transfer, conservation laws, and flow measurement for process fluids.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 2224A/B", title: "Chemical Engineering Thermodynamics", description: "Phase equilibria, solution behaviour, and reaction equilibria in separation processes.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 2290A/B", title: "Fundamentals of Biochemical and Environmental Engineering", description: "Microbiology and biochemistry applied to environmental engineering problems.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 3310A/B", title: "Process Dynamics and Control", description: "Dynamic behaviour and control of chemical processes, with MATLAB/Simulink.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 3315A/B", title: "Reaction Engineering", description: "Chemical kinetics and the reactor design math that follows from it.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 3322A/B", title: "Heat Transfer Operations", description: "Conduction, convection, and radiation, applied to heat exchanger design.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 3324A/B", title: "Mass Transfer Operations", description: "Absorption, stripping, humidification, and drying equipment design.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 4409A/B", title: "Wastewater Treatment", description: "Municipal wastewater processes, regulation, and treatment plant design.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "CBE 4417A/B", title: "Principles and Applications of Heterogeneous Catalysis", description: "Kinetics and mechanisms behind industrially catalyzed reactions.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "CBE 4497", title: "Chemical Process & Plant Design", description: "Capstone full-scale process design, covering equipment and cost analysis.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CBE 4498", title: "Biochemical Process and Plant Design", description: "Capstone design project for biochemical process plants.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
  ],
  civil: [
    { code: "CEE 2202A/B", title: "Mechanics of Materials", description: "Stress, strain, torsion, and beam bending — the core toolkit for structural analysis.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 2217A/B", title: "Introduction to Environmental Engineering", description: "Mass and energy transfer, environmental chemistry, and pollution management.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 2225A/B", title: "Fundamentals of Fluid Mechanics", description: "Fluid statics and the continuity, momentum, and energy equations.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 3324A/B", title: "Surveying", description: "Plane surveying theory alongside AutoCAD for civil drawings.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 3340A/B", title: "Analysis of Indeterminate Structures", description: "Frames, continuous beams, and arches, by hand and by computer.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 3346A/B", title: "Steel Design", description: "Tension members, columns, beams, and connections under Limit States Design.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 3347A/B", title: "Reinforced Concrete Design", description: "Serviceability and ultimate limit states for beams, slabs, and columns.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 3361A/B", title: "Water Resources Management", description: "Regulatory, economic, sustainability, and climate-change dimensions of water systems.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "CEE 4401A/B", title: "Principles of Transportation Engineering", description: "Vehicle motion, geometric design, traffic modelling, and planning.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "CEE 4426A/B", title: "Geotechnical Engineering Design", description: "Site investigation, shallow and deep foundations, and retaining structures.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "CEE 4440", title: "Civil Engineering Thesis", description: "Individual research thesis, presented publicly at year's end.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "CEE 4441", title: "Civil Engineering Design Project", description: "Capstone team design project.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
  ],
  electrical: [
    { code: "ECE 2205A/B", title: "Electric Circuits", description: "Ohm's and Kirchhoff's Laws, nodal/mesh analysis, and network theorems.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 2236A/B", title: "Magnetic Circuits & Transmission Lines", description: "Three-phase circuits, transformers, and the telegrapher equations.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 2277A/B", title: "Digital Logic Systems", description: "Boolean algebra, Karnaugh maps, and the logic/memory systems built from them.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 3332A/B", title: "Electric Machines", description: "Magnetic fields, transformers, and DC/synchronous/induction machines.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 3333A/B", title: "Electric Power Systems I", description: "The per-unit system, three-phase transmission, and power flow.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 3336A/B", title: "Electromagnetic Theory", description: "RF transmission lines, the Smith chart, and Maxwell's equations.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 3349A/B", title: "Introduction of VLSI", description: "Semiconductor physics and CMOS circuit design.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 3375A/B", title: "Microprocessors & Microcomputers", description: "CPUs, memory, and I/O interfacing for real microprocessor applications.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 3389A/B", title: "Computer System Design", description: "Computer architecture, memory hierarchy, and RISC/multi-core design.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 4436A/B", title: "Networking: Principles, Protocols and Architecture", description: "The OSI/TCP-IP models, packet switching, and routing.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 4457A/B", title: "Power Electronics", description: "Power semiconductor devices and converter topologies.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 4460A/B", title: "Real-Time and Embedded Systems", description: "Real-time kernels, multi-tasking, and schedulability analysis.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ECE 4464A/B", title: "Electric Power Systems II", description: "Power flow, faults, stability, and HVDC/FACTS.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ECE 4416", title: "Electrical/Computer Design Project", description: "Capstone design project.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
  ],
  "green-process": [
    { code: "GPE 2213A/B", title: "Green Chemistry I", description: "Chemistry principles applied to reducing environmental impact in process design.", yearLevel: 2, termsOffered: ["FALL"], isCore: true },
    { code: "GPE 2214A/B", title: "Green Chemistry II", description: "Continuation of Green Chemistry I, moving into applied process contexts.", yearLevel: 2, termsOffered: ["WINTER"], isCore: true },
    { code: "GPE 3382A/B", title: "Fundamentals of Green Engineering", description: "Core principles for designing processes with sustainability built in from the start.", yearLevel: 3, termsOffered: ["FALL"], isCore: true },
    { code: "GPE 3383A/B", title: "Solar and Fuel Cells", description: "Solar energy conversion and fuel cell technology fundamentals.", yearLevel: 3, termsOffered: ["WINTER"], isCore: true },
    { code: "GPE 4484A/B", title: "Green Fuels & Chemicals", description: "Sustainable production pathways for fuels and industrial chemicals.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
  ],
  integrated: [
    { code: "IE 2200Y", title: "Practical Elements in Integrated Engineering", description: "Hands-on practice of the technical and software skills used across design projects.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "IE 2298", title: "Integrated Systems Engineering and Design", description: "The systems engineering V-model and human-centred, sustainability-aware design.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "IE 2299A/B", title: "Integrated Systems and Design", description: "Systems engineering approaches drawn from multiple disciplinary frameworks.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "IE 2399A/B", title: "Systems Engineering Project", description: "Applied systems engineering methods through a multidisciplinary project.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "IE 4490A/B", title: "Integrated Engineering Undergraduate Research", description: "Independent research under faculty supervision.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "IE 4491A/B", title: "Integrated Engineering Undergraduate Research", description: "Continuation of IE 4490's independent research.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "IE 4499", title: "Interdisciplinary Engineering Design Project", description: "Capstone team design project spanning multiple engineering disciplines.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "ELI 3000A/B", title: "Managing the Innovation Process", description: "How organizations move ideas from concept to commercialized product.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ELI 3100A/B", title: "Planning and Project Management", description: "Project planning, scheduling, and management tools for engineering teams.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ELI 4100F/G", title: "Engineering Leadership", description: "Leadership theory and practice framed around engineering teams and projects.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "ELI 4200A/B", title: "The Entrepreneurial Environment", description: "What it actually takes to start and grow a venture, from an engineer's seat.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
  ],
  mechanical: [
    { code: "MME 2202A/B", title: "Mechanics of Materials", description: "Stress, strain, Mohr's circle, torsion, and beam bending.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 2204A/B", title: "Thermodynamics I", description: "The first and second laws, ideal gases, and energy conversion systems.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 2213A/B", title: "Engineering Dynamics", description: "Rectilinear, angular, and curvilinear motion for particles and rigid bodies.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 2259A/B", title: "Product Design & Development", description: "The mechanical design process, DFMA, and concept generation.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 3303A/B", title: "Fluid Mechanics II", description: "Rigid-body motion, control volume analysis, and centrifugal pumps.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 3325A/B", title: "Mechanical Vibrations", description: "Single and multi-degree-of-freedom systems, damping, and modal analysis.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 3348A/B", title: "Manufacturing Processes", description: "Industrial manufacturing processes and how they shape material performance.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 3380A/B", title: "Mechanical Components Design", description: "Stress analysis and design of standard machine components.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MME 4423A/B", title: "Internal Combustion Engines", description: "Spark-ignition and diesel engine design and performance.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "MME 4452A/B", title: "Robotics & Manufacturing Automation", description: "Sensors, actuators, industrial robots, and machine vision.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "MME 4410", title: "Mechanical & Materials Engineering Thesis", description: "Individual thesis research, presented publicly at year's end.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "MME 4499", title: "Mechanical Engineering Design Project", description: "Capstone team design project.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
  ],
  mechatronics: [
    { code: "MSE 2201A/B", title: "Introduction to Electrical Instrumentation", description: "Instrumentation basics, electronics, and signal conditioning.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 2202A/B", title: "Intro to Mechatronic Design", description: "Structured design methods for mechatronic systems.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 2221A/B", title: "Computational Methods for Mechatronic Systems Engineers", description: "Numerical methods and their programming applications.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 2233A/B", title: "Circuits and Systems", description: "The s-plane, frequency response, and Laplace transforms.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 3301A/B", title: "Materials Selection and Manufacturing Processes", description: "Choosing materials for mechatronic components, including smart materials.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 3302A/B", title: "Sensors & Actuators", description: "Traditional sensors, MEMS sensing, and smart materials.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 3310A/B", title: "Electric Motors and Drives", description: "DC/AC motor operation and power electronics integration.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "MSE 4401A/B", title: "Robotic Manipulators", description: "Kinematics, dynamics, and control of rigid-link manipulators.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "MSE 4499", title: "Mechatronic Design Project", description: "Interdisciplinary capstone design project.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
  ],
  software: [
    { code: "SE 2202A/B", title: "Scripting Programming Language Fundamentals", description: "JavaScript scripting alongside HTML/CSS basics.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 2203A/B", title: "Software Design", description: "Object-oriented design and UML for real-time and distributed systems.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 2205A/B", title: "Algorithms & Data Structure for Object-Oriented Design", description: "Algorithms and data structures, with an eye on performance at scale.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 2250A/B", title: "Software Construction", description: "Implementation, testing, tooling, debugging, and change management.", yearLevel: 2, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 3309A/B", title: "Database Management Systems", description: "Relational databases, entity-relationship modelling, and query languages.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 3313A/B", title: "Operating Systems for Software Engineering", description: "OS theory and construction, including real-time and embedded systems.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 3350A/B", title: "Software Engineering Design I", description: "A large group project run like professional practice.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 3352A/B", title: "Software Requirements and Analysis", description: "Feasibility studies and requirements elicitation and validation.", yearLevel: 3, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 4450", title: "Software Engineering Design II", description: "Capstone large-scale software project.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: true },
    { code: "SE 4452A/B", title: "Software Testing & Maintenance", description: "Testing techniques, verification, validation, and maintenance.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "SE 4455A/B", title: "Cloud Computing: Concepts, Technologies and Applications", description: "Virtualization and distributed systems, with hands-on VM labs.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
    { code: "SE 4472A/B", title: "Information Security", description: "Network security and protecting information systems.", yearLevel: 4, termsOffered: ["FALL", "WINTER"], isCore: false },
  ],
};
