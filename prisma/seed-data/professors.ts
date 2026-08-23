/**
 * Real Western Engineering (and first-year service-department) instructors,
 * cross-referenced against RateMyProfessors' own per-professor course tags
 * and each department's public faculty roster. Only medium-confidence-or-
 * better course matches are included -- see the research notes this was
 * compiled from for what was excluded (speculative low-confidence guesses,
 * and course codes with no plausible instructor found at all, e.g. AISE,
 * IE, ELI, and BME currently have essentially no RMP presence, likely
 * because those are newer or smaller programs).
 *
 * `title` is deliberately always "Professor" rather than a specific rank
 * (Assistant/Associate/Full/Teaching) -- academic rank wasn't part of what
 * was verified here, and guessing a specific rank for a real named person
 * would be asserting something as fact that was never actually confirmed.
 */
export type RealProfessorSeed = {
  firstName: string;
  lastName: string;
  slug: string;
  disciplineSlug: string | null;
  courseCodes: string[];
};

export const REAL_PROFESSORS: RealProfessorSeed[] = [
  { firstName: "Anestis", lastName: "Dounavis", slug: "anestis-dounavis", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B", "ECE 2277A/B", "MSE 2233A/B"] },
  { firstName: "Abdelnasser", lastName: "Ouda", slug: "abdelnasser-ouda", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B", "SE 2203A/B", "SE 2205A/B", "SE 4452A/B", "ECE 4436A/B", "ES 1036A/B"] },
  { firstName: "Kevin", lastName: "McGuire", slug: "kevin-mcguire", disciplineSlug: "first-year", courseCodes: ["ES 1050"] },
  { firstName: "Quazi", lastName: "Rahman", slug: "quazi-rahman", disciplineSlug: "software", courseCodes: ["ES 1036A/B", "MSE 2233A/B", "SE 2205A/B", "SE 2250A/B"] },
  { firstName: "Abdelkader", lastName: "Baayoun", slug: "abdelkader-baayoun", disciplineSlug: "mechanical", courseCodes: ["ES 1021A/B", "MSE 3301A/B"] },
  { firstName: "L.Y.", lastName: "Jiang", slug: "ly-jiang", disciplineSlug: "mechanical", courseCodes: ["MME 2202A/B", "MME 3325A/B", "MSE 2202A/B"] },
  { firstName: "Louis", lastName: "Ferreira", slug: "louis-ferreira", disciplineSlug: "mechanical", courseCodes: ["MME 2259A/B", "MME 4499"] },
  { firstName: "Jeff", lastName: "Wood", slug: "jeff-wood", disciplineSlug: "first-year", courseCodes: ["ES 1021A/B"] },
  { firstName: "Aiham", lastName: "Adawi", slug: "aiham-adawi", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Yang", lastName: "Zhao", slug: "yang-zhao", disciplineSlug: "first-year", courseCodes: ["ES 1021A/B"] },
  { firstName: "John", lastName: "Dickinson", slug: "john-dickinson", disciplineSlug: "first-year", courseCodes: ["ES 1050"] },
  { firstName: "Daniel", lastName: "Rosin", slug: "daniel-rosin", disciplineSlug: "first-year", courseCodes: ["BUS 1299E"] },
  { firstName: "Hanif", lastName: "Ladak", slug: "hanif-ladak", disciplineSlug: "electrical", courseCodes: ["ECE 4457A/B"] },
  { firstName: "Ilia", lastName: "Polushin", slug: "ilia-polushin", disciplineSlug: "electrical", courseCodes: ["ECE 3332A/B"] },
  { firstName: "Jagath", lastName: "Samarabandu", slug: "jagath-samarabandu", disciplineSlug: "software", courseCodes: ["SE 2250A/B"] },
  { firstName: "Bogdan", lastName: "Tudose", slug: "bogdan-tudose", disciplineSlug: "first-year", courseCodes: ["NMM 1412A", "NMM 1411A/B", "NMM 1414B"] },
  { firstName: "Roy", lastName: "Eagleson", slug: "roy-eagleson", disciplineSlug: "electrical", courseCodes: ["ECE 4416"] },
  { firstName: "Abdallah", lastName: "Shami", slug: "abdallah-shami", disciplineSlug: "electrical", courseCodes: ["ECE 4436A/B"] },
  { firstName: "Sohrab", lastName: "Rohani", slug: "sohrab-rohani", disciplineSlug: "chemical", courseCodes: ["CBE 2224A/B"] },
  { firstName: "Shaimaa", lastName: "Ali", slug: "shaimaa-ali", disciplineSlug: "software", courseCodes: ["SE 2202A/B", "SE 2205A/B", "SE 3350A/B", "SE 3352A/B"] },
  { firstName: "Michael", lastName: "Naish", slug: "michael-naish", disciplineSlug: "mechatronics", courseCodes: ["MSE 2202A/B"] },
  { firstName: "Serguei", lastName: "Primak", slug: "serguei-primak", disciplineSlug: "electrical", courseCodes: ["ECE 3336A/B", "MSE 2221A/B"] },
  { firstName: "Rajni", lastName: "Patel", slug: "rajni-patel", disciplineSlug: "mechatronics", courseCodes: ["MSE 4401A/B"] },
  { firstName: "Ken", lastName: "McIsaac", slug: "ken-mcisaac", disciplineSlug: "electrical", courseCodes: ["ECE 3375A/B", "ECE 3389A/B", "SE 3313A/B"] },
  { firstName: "Anthony", lastName: "Straatman", slug: "anthony-straatman", disciplineSlug: "mechanical", courseCodes: ["MME 2204A/B"] },
  { firstName: "Shahzad", lastName: "Barghi", slug: "shahzad-barghi", disciplineSlug: "chemical", courseCodes: ["CBE 4417A/B", "CBE 4497", "ES 1050"] },
  { firstName: "Ana", lastName: "Trejos", slug: "ana-trejos", disciplineSlug: "mechatronics", courseCodes: ["MSE 3302A/B", "MSE 4401A/B"] },
  { firstName: "Dennis", lastName: "Michaelson", slug: "dennis-michaelson", disciplineSlug: "mechatronics", courseCodes: ["MSE 3310A/B"] },
  { firstName: "Jonathon", lastName: "Southen", slug: "jonathon-southen", disciplineSlug: "civil", courseCodes: ["CEE 3340A/B", "ES 1050"] },
  { firstName: "Roger", lastName: "Khayat", slug: "roger-khayat", disciplineSlug: "mechanical", courseCodes: ["MME 2213A/B", "MME 3303A/B"] },
  { firstName: "Gerry", lastName: "Moschopoulos", slug: "gerry-moschopoulos", disciplineSlug: "electrical", courseCodes: ["ECE 3332A/B", "ECE 4457A/B"] },
  { firstName: "Mehrdad", lastName: "Kermani", slug: "mehrdad-kermani", disciplineSlug: "electrical", courseCodes: ["ECE 4460A/B", "ECE 4464A/B"] },
  { firstName: "Arash", lastName: "Reyhani-Masoleh", slug: "arash-reyhani-masoleh", disciplineSlug: "electrical", courseCodes: ["ECE 3349A/B", "ECE 2277A/B"] },
  { firstName: "Rajiv", lastName: "Varma", slug: "rajiv-varma", disciplineSlug: "electrical", courseCodes: ["ECE 3333A/B", "ECE 4464A/B"] },
  { firstName: "Jim", lastName: "Johnson", slug: "jim-johnson", disciplineSlug: "mechanical", courseCodes: ["MME 3380A/B"] },
  { firstName: "Amarjeet", lastName: "Bassi", slug: "amarjeet-bassi", disciplineSlug: "chemical", courseCodes: ["CBE 2220A/B", "CBE 2290A/B"] },
  { firstName: "Silvia", lastName: "Mittler", slug: "silvia-mittler", disciplineSlug: "first-year", courseCodes: ["PHYS 1401A/B"] },
  { firstName: "Andrea", lastName: "Soddu", slug: "andrea-soddu", disciplineSlug: "first-year", courseCodes: ["PHYS 1401A/B"] },
  { firstName: "Mark", lastName: "Baker", slug: "mark-baker", disciplineSlug: "first-year", courseCodes: ["PHYS 1402A/B"] },
  { firstName: "Zhifeng", lastName: "Ding", slug: "zhifeng-ding", disciplineSlug: "first-year", courseCodes: ["CHEM 1302A/B"] },
  { firstName: "Christina", lastName: "Booker", slug: "christina-booker", disciplineSlug: "first-year", courseCodes: ["CHEM 1302A/B"] },
];
