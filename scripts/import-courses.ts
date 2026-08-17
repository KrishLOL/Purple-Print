import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

/**
 * Upserts courses from a CSV so real course data can be loaded without
 * touching prisma/seed.ts. Columns: code,title,discipline,year,description
 *
 * `discipline` matches a Discipline by slug, code, or name (case-insensitive).
 * Leave it blank for first-year-common courses that belong to no discipline.
 *
 * Usage: pnpm exec tsx scripts/import-courses.ts path/to/courses.csv
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== "")) rows.push(row);
  }
  return rows;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: pnpm exec tsx scripts/import-courses.ts path/to/courses.csv");
    process.exitCode = 1;
    return;
  }

  const rows = parseCsv(readFileSync(filePath, "utf-8"));
  const [header, ...dataRows] = rows;
  const columns = header.map((h) => h.trim().toLowerCase());
  const idx = (name: string) => columns.indexOf(name);

  const codeIdx = idx("code");
  const titleIdx = idx("title");
  const disciplineIdx = idx("discipline");
  const yearIdx = idx("year");
  const descriptionIdx = idx("description");

  if ([codeIdx, titleIdx, disciplineIdx, yearIdx, descriptionIdx].includes(-1)) {
    console.error("CSV header must be: code,title,discipline,year,description");
    process.exitCode = 1;
    return;
  }

  const disciplines = await prisma.discipline.findMany();
  const findDiscipline = (raw: string) => {
    const needle = raw.trim().toLowerCase();
    if (!needle) return null;
    return (
      disciplines.find(
        (d) =>
          d.slug.toLowerCase() === needle ||
          d.code.toLowerCase() === needle ||
          d.name.toLowerCase() === needle,
      ) ?? null
    );
  };

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const code = row[codeIdx]?.trim();
    const title = row[titleIdx]?.trim();
    const disciplineRaw = row[disciplineIdx]?.trim() ?? "";
    const yearLevel = Number.parseInt(row[yearIdx]?.trim() ?? "", 10);
    const description = row[descriptionIdx]?.trim() ?? "";

    if (!code || !title || !Number.isFinite(yearLevel)) {
      console.warn(`Skipping row (missing code/title/year): ${row.join(",")}`);
      skipped++;
      continue;
    }

    const discipline = findDiscipline(disciplineRaw);
    if (disciplineRaw && !discipline) {
      console.warn(`Skipping ${code}: no discipline matches "${disciplineRaw}"`);
      skipped++;
      continue;
    }

    const existing = await prisma.course.findUnique({ where: { code } });

    await prisma.course.upsert({
      where: { code },
      create: {
        code,
        title,
        description,
        yearLevel,
        disciplineId: discipline?.id ?? null,
        termsOffered: [],
        isCore: true,
        isFirstYearCommon: false,
      },
      update: {
        title,
        description,
        yearLevel,
        disciplineId: discipline?.id ?? null,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(
    `Imported ${dataRows.length - skipped} courses from ${filePath}: ${created} created, ${updated} updated, ${skipped} skipped.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
