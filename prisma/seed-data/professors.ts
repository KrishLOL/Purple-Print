/**
 * Real Western Engineering (and first-year service-department) instructors.
 * Course associations are cross-referenced against RateMyProfessors' own
 * per-professor course tags (medium-confidence-or-better matches only) and
 * official eng.uwo.ca sources -- a department bio explicitly naming a
 * course/teaching-focus area, or a course outline / "Teaching" page citing
 * an instructor directly. Titles are the real ones published on each
 * department's faculty roster (eng.uwo.ca), retrieved 24 Aug 2026 -- where
 * a professor isn't on one of the four core department rosters
 * (Physics/Chemistry/Applied Math service-course instructors, or programs
 * outside those four departments), `title` falls back to a generic
 * "Professor" rather than guessing a specific rank that was never actually
 * confirmed.
 *
 * Course codes with no plausible instructor found at all after two research
 * passes (e.g. most of AISE, all of IE and ELI, most of BME -- newer or
 * smaller programs with little public presence to cross-reference against)
 * are simply absent rather than guessed at.
 */
export type RealProfessorSeed = {
  firstName: string;
  lastName: string;
  slug: string;
  title: string;
  disciplineSlug: string | null;
  courseCodes: string[];
};

export const REAL_PROFESSORS: RealProfessorSeed[] = [
  { firstName: "Anestis", lastName: "Dounavis", slug: "anestis-dounavis", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B", "ECE 2277A/B", "MSE 2233A/B"] },
  { firstName: "Abdelkader", lastName: "Ouda", slug: "abdelkader-ouda", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B", "SE 2203A/B", "SE 2205A/B", "SE 4452A/B", "ECE 4436A/B", "ES 1036A/B"] },
  { firstName: "Quazi", lastName: "Rahman", slug: "quazi-rahman", title: "Associate Professor", disciplineSlug: "software", courseCodes: ["ES 1036A/B", "MSE 2233A/B", "SE 2205A/B", "SE 2250A/B"] },
  { firstName: "Abdelkader", lastName: "Baayoun", slug: "abdelkader-baayoun", title: "Professor", disciplineSlug: "mechanical", courseCodes: ["ES 1021A/B", "MSE 3301A/B"] },
  { firstName: "Liying", lastName: "Jiang", slug: "liying-jiang", title: "Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2202A/B", "MME 3325A/B", "MSE 2202A/B"] },
  { firstName: "Louis", lastName: "Ferreira", slug: "louis-ferreira", title: "Associate Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2259A/B", "MME 4499", "BME 4400E"] },
  { firstName: "Jeffrey", lastName: "Wood", slug: "jeff-wood", title: "Professor; Associate Dean, Undergraduate Studies (Engineering)", disciplineSlug: "first-year", courseCodes: ["ES 1021A/B"] },
  { firstName: "Aiham", lastName: "Adawi", slug: "aiham-adawi", title: "Professor", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Yang", lastName: "Zhao", slug: "yang-zhao", title: "Associate Professor", disciplineSlug: "first-year", courseCodes: ["ES 1021A/B"] },
  { firstName: "John", lastName: "Dickinson", slug: "john-dickinson", title: "Professor", disciplineSlug: "first-year", courseCodes: ["ES 1050"] },
  { firstName: "Daniel", lastName: "Rosin", slug: "daniel-rosin", title: "Professor", disciplineSlug: "first-year", courseCodes: ["BUS 1299E"] },
  { firstName: "Hanif", lastName: "Ladak", slug: "hanif-ladak", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 4457A/B"] },
  { firstName: "Ilia", lastName: "Polushin", slug: "ilia-polushin", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3332A/B"] },
  { firstName: "Jagath", lastName: "Samarabandu", slug: "jagath-samarabandu", title: "Professor", disciplineSlug: "software", courseCodes: ["SE 2250A/B"] },
  { firstName: "Bogdan", lastName: "Tudose", slug: "bogdan-tudose", title: "Professor", disciplineSlug: "first-year", courseCodes: ["NMM 1412A", "NMM 1411A/B", "NMM 1414B"] },
  { firstName: "Roy", lastName: "Eagleson", slug: "roy-eagleson", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 4416"] },
  { firstName: "Abdallah", lastName: "Shami", slug: "abdallah-shami", title: "Professor and Department Chair", disciplineSlug: "electrical", courseCodes: ["ECE 4436A/B"] },
  { firstName: "Sohrab", lastName: "Rohani", slug: "sohrab-rohani", title: "Professor", disciplineSlug: "chemical", courseCodes: ["CBE 2224A/B"] },
  { firstName: "Shaimaa", lastName: "Ali", slug: "shaimaa-ali", title: "Assistant Professor", disciplineSlug: "software", courseCodes: ["SE 2202A/B", "SE 2205A/B", "SE 3350A/B", "SE 3352A/B"] },
  { firstName: "Michael", lastName: "Naish", slug: "michael-naish", title: "Associate Professor; Director, Mechatronic Systems Engineering", disciplineSlug: "mechatronics", courseCodes: ["MSE 2202A/B"] },
  { firstName: "Serguei", lastName: "Primak", slug: "serguei-primak", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3336A/B", "MSE 2221A/B"] },
  { firstName: "Rajni", lastName: "Patel", slug: "rajni-patel", title: "Professor", disciplineSlug: "mechatronics", courseCodes: ["MSE 4401A/B"] },
  { firstName: "Ken", lastName: "McIsaac", slug: "ken-mcisaac", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3375A/B", "ECE 3389A/B", "SE 3313A/B"] },
  { firstName: "Anthony", lastName: "Straatman", slug: "anthony-straatman", title: "Professor and Department Chair", disciplineSlug: "mechanical", courseCodes: ["MME 2204A/B", "MME 4410"] },
  { firstName: "Shahzad", lastName: "Barghi", slug: "shahzad-barghi", title: "Associate Professor; MEng Program Director", disciplineSlug: "chemical", courseCodes: ["CBE 4417A/B", "CBE 4497", "ES 1050"] },
  { firstName: "Ana", lastName: "Trejos", slug: "ana-trejos", title: "Professor", disciplineSlug: "mechatronics", courseCodes: ["MSE 3302A/B", "MSE 4401A/B"] },
  { firstName: "Dennis", lastName: "Michaelson", slug: "dennis-michaelson", title: "Assistant Professor", disciplineSlug: "mechatronics", courseCodes: ["MSE 3310A/B"] },
  { firstName: "Jonathon", lastName: "Southen", slug: "jonathon-southen", title: "Assistant Professor; Associate Chair (Undergraduate)", disciplineSlug: "civil", courseCodes: ["CEE 3340A/B", "ES 1050", "CEE 4441", "CEE 3324A/B"] },
  { firstName: "Roger", lastName: "Khayat", slug: "roger-khayat", title: "Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2213A/B", "MME 3303A/B"] },
  { firstName: "Gerry", lastName: "Moschopoulos", slug: "gerry-moschopoulos", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3332A/B", "ECE 4457A/B"] },
  { firstName: "Mehrdad", lastName: "Kermani", slug: "mehrdad-kermani", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 4460A/B", "ECE 4464A/B"] },
  { firstName: "Arash", lastName: "Reyhani-Masoleh", slug: "arash-reyhani-masoleh", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3349A/B", "ECE 2277A/B"] },
  { firstName: "Rajiv", lastName: "Varma", slug: "rajiv-varma", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 3333A/B", "ECE 4464A/B"] },
  { firstName: "James", lastName: "Johnson", slug: "jim-johnson", title: "Professor; Graham King Research Chair", disciplineSlug: "mechanical", courseCodes: ["MME 3380A/B"] },
  { firstName: "Amarjeet", lastName: "Bassi", slug: "amarjeet-bassi", title: "Professor and Chair (on admin leave)", disciplineSlug: "chemical", courseCodes: ["CBE 2220A/B", "CBE 2290A/B"] },
  { firstName: "Silvia", lastName: "Mittler", slug: "silvia-mittler", title: "Professor", disciplineSlug: "first-year", courseCodes: ["PHYS 1401A/B"] },
  { firstName: "Andrea", lastName: "Soddu", slug: "andrea-soddu", title: "Professor", disciplineSlug: "first-year", courseCodes: ["PHYS 1401A/B"] },
  { firstName: "Mark", lastName: "Baker", slug: "mark-baker", title: "Professor", disciplineSlug: "first-year", courseCodes: ["PHYS 1402A/B"] },
  { firstName: "Zhifeng", lastName: "Ding", slug: "zhifeng-ding", title: "Professor", disciplineSlug: "first-year", courseCodes: ["CHEM 1302A/B"] },
  { firstName: "Christina", lastName: "Booker", slug: "christina-booker", title: "Professor", disciplineSlug: "first-year", courseCodes: ["CHEM 1302A/B"] },

  // Added from an explicit course mention on the professor's own department
  // bio (eng.uwo.ca), rather than an RMP course tag.
  { firstName: "Angela", lastName: "Mawdsley", slug: "angela-mawdsley", title: "Assistant Professor (joint with Thompson Centre)", disciplineSlug: "first-year", courseCodes: ["ES 1050"] },
  // Her department bio names "mechanics of materials" and "steel design" as
  // her teaching focus -- exact title matches to CEE 2202A/B and CEE
  // 3346A/B respectively.
  { firstName: "Hassan", lastName: "El-Chabib", slug: "hassan-el-chabib", title: "Assistant Professor; Associate Chair (Graduate Professional Programs)", disciplineSlug: "civil", courseCodes: ["CEE 2202A/B", "CEE 3346A/B"] },

  // Kevin McGuire was previously listed here (RMP tag suggested ES 1050),
  // but his official department bio names his actual course as CEE 3348a/b
  // -- a code that doesn't exist in our catalog -- which contradicts the
  // ES 1050 guess rather than merely leaving it unconfirmed. Dropped
  // entirely rather than keep a specifically-contradicted attribution.

  // --- Second research pass: RMP profile tags + official course-outline /
  // department "Teaching" page citations, searched by exact name against
  // the full official roster rather than generic department queries. A
  // few leads this pass were explicitly flagged as ambiguous ("code
  // drift" between an RMP tag and our exact catalog code, or simply
  // unconfirmed against a primary source) and are deliberately left out:
  // Wenxing Zhou/CEE 2225A/B, Craig Miller/CEE 2225A/B, Fang Fang/AISE
  // 4430A/B, Yimin Yang/AISE 3010A/B, Lyndon Brown/ECE 3389A/B, Aaron
  // Price/MME 3380A/B, and a loose Kevin McGuire/ELI lead.
  { firstName: "Kibret", lastName: "Mequanint", slug: "kibret-mequanint", title: "Professor; Western Research Chair in Therapeutic Biomaterials; Acting Department Chair", disciplineSlug: "chemical", courseCodes: ["CBE 2224A/B", "CBE 3322A/B"] },
  { firstName: "Michael", lastName: "Boutilier", slug: "michael-boutilier", title: "Associate Professor", disciplineSlug: "chemical", courseCodes: ["CBE 2221A/B"] },
  { firstName: "Hugo", lastName: "de Lasa", slug: "hugo-de-lasa", title: "Professor", disciplineSlug: "chemical", courseCodes: ["CBE 3315A/B"] },
  { firstName: "Jose", lastName: "Herrera", slug: "jose-herrera", title: "Professor", disciplineSlug: "chemical", courseCodes: ["CBE 4417A/B", "CBE 3315A/B"] },
  { firstName: "Arghya", lastName: "Paul", slug: "arghya-paul", title: "Professor; Canada Research Chair", disciplineSlug: "chemical", courseCodes: ["CBE 2290A/B"] },
  { firstName: "Chris", lastName: "Power", slug: "chris-power", title: "Associate Professor", disciplineSlug: "civil", courseCodes: ["CEE 2217A/B"] },
  { firstName: "Craig", lastName: "Miller", slug: "craig-miller", title: "Assistant Professor; Assistant Dean, First-Year Studies", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Ayman", lastName: "El Ansary", slug: "ayman-el-ansary", title: "Associate Professor; Associate Chair (Graduate)", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Hesham", lastName: "El Naggar", slug: "hesham-el-naggar", title: "Professor; Director, John M. Thompson Centre for Engineering Leadership & Innovation", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Ayan", lastName: "Sadhu", slug: "ayan-sadhu", title: "Associate Professor; CRC in Smart and Sustainable Civil Infrastructure", disciplineSlug: "first-year", courseCodes: ["ES 1022Y"] },
  { firstName: "Maged", lastName: "Youssef", slug: "maged-youssef", title: "Professor", disciplineSlug: "civil", courseCodes: ["CEE 3347A/B", "CEE 4440", "CEE 4441", "ES 1022Y"] },
  { firstName: "Tim", lastName: "Newson", slug: "tim-newson", title: "Professor", disciplineSlug: "civil", courseCodes: ["CEE 4426A/B"] },
  { firstName: "Kelly", lastName: "Tang", slug: "kelly-tang", title: "Assistant Professor", disciplineSlug: "civil", courseCodes: ["CEE 4401A/B"] },
  { firstName: "Firouz", lastName: "Badrkhani Ajaei", slug: "firouz-badrkhani-ajaei", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2236A/B"] },
  { firstName: "Miriam", lastName: "Capretz", slug: "miriam-capretz", title: "Professor", disciplineSlug: "software", courseCodes: ["SE 3309A/B"] },
  { firstName: "Aleksander", lastName: "Essex", slug: "aleksander-essex", title: "Associate Professor", disciplineSlug: "software", courseCodes: ["SE 4472A/B"] },
  { firstName: "Katarina", lastName: "Grolinger", slug: "katarina-grolinger", title: "Associate Professor", disciplineSlug: "software", courseCodes: ["SE 3309A/B", "SE 3313A/B"] },
  { firstName: "Fang", lastName: "Fang", slug: "fang-fang", title: "Assistant Professor", disciplineSlug: "electrical", courseCodes: ["ECE 4436A/B"] },
  { firstName: "Valerie", lastName: "Platsko", slug: "valerie-platsko", title: "Lecturer", disciplineSlug: "software", courseCodes: ["SE 4455A/B"] },
  { firstName: "Elvis", lastName: "Chen", slug: "elvis-chen", title: "Assistant Professor; Chair, IEEE EMBS London Chapter", disciplineSlug: "aise", courseCodes: ["AISE 3350A/B"] },
  { firstName: "Abbas", lastName: "Samani", slug: "abbas-samani", title: "Professor", disciplineSlug: "mechatronics", courseCodes: ["MSE 4499"] },
  { firstName: "Luiz", lastName: "Capretz", slug: "luiz-capretz", title: "Professor", disciplineSlug: "software", courseCodes: ["SE 3352A/B"] },
  { firstName: "James", lastName: "Lacefield", slug: "james-lacefield", title: "Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2277A/B"] },
  { firstName: "John", lastName: "McLeod", slug: "john-mcleod", title: "Assistant Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B", "ECE 3375A/B", "ECE 2277A/B"] },
  { firstName: "Lyndon", lastName: "Brown", slug: "lyndon-brown", title: "Associate Professor", disciplineSlug: "electrical", courseCodes: ["ECE 2205A/B"] },
  { firstName: "Yimin", lastName: "Yang", slug: "yimin-yang", title: "Assistant Professor", disciplineSlug: "software", courseCodes: ["SE 2202A/B"] },
  { firstName: "Hamid", lastName: "Abdolvand", slug: "hamid-abdolvand", title: "Associate Professor; Tier 2 CRC in Advanced Materials for Low-Emission Energies", disciplineSlug: "first-year", courseCodes: ["ES 1021A/B"] },
  { firstName: "Christopher", lastName: "DeGroot", slug: "christopher-degroot", title: "Assistant Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2213A/B", "ES 1021A/B", "MME 4499"] },
  { firstName: "Thomas", lastName: "Jenkyn", slug: "thomas-jenkyn", title: "Associate Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2213A/B"] },
  { firstName: "George", lastName: "Knopf", slug: "george-knopf", title: "Professor; Director, Engineering in Medicine (MEng)", disciplineSlug: "mechanical", courseCodes: ["MME 2259A/B"] },
  { firstName: "Emily", lastName: "Lalone", slug: "emily-lalone", title: "Associate Professor; Associate Director, Biomedical Engineering (Undergraduate)", disciplineSlug: "mechanical", courseCodes: ["MME 2202A/B", "BME 3201A/B"] },
  { firstName: "Aaron", lastName: "Price", slug: "aaron-price", title: "Associate Professor", disciplineSlug: "mechanical", courseCodes: ["MME 2259A/B"] },
  { firstName: "Kamran", lastName: "Siddiqui", slug: "kamran-siddiqui", title: "Professor; Vice-Provost (Graduate and Postdoctoral Studies)", disciplineSlug: "mechanical", courseCodes: ["MME 3303A/B"] },
  { firstName: "Remus", lastName: "Tutunea-Fatan", slug: "remus-tutunea-fatan", title: "Professor; Associate Chair (Graduate Research Programs)", disciplineSlug: "mechanical", courseCodes: ["MME 4499"] },
  { firstName: "Hanyang", lastName: "Shi", slug: "hanyang-shi", title: "Assistant Professor", disciplineSlug: "mechanical", courseCodes: ["MME 3348A/B", "MME 4452A/B"] },
  { firstName: "Haojie", lastName: "Mao", slug: "haojie-mao", title: "Associate Professor", disciplineSlug: "mechanical", courseCodes: ["MME 4499", "MME 4410"] },
];
