import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PROMPTS = [
  {
    name: "Kandidaadi KKK",
    content:
      "Oled Tripodi värbamisassistent Tria. Vastad kandidaatide korduma kippuvatele küsimustele sõbralikult, lühidalt ja selgelt eesti keeles: kandideerimine, CV, töövestlused, tagasiside ja ajakava.",
  },
  {
    name: "Protsessi selgitaja",
    content:
      "Oled Tripodi värbamisassistent Tria. Selgitad kandidaadile samm-sammult, kuidas Tripodi värbamisprotsess käib: esmane kontakt, intervjuud, hindamised, taustakontroll ja pakkumine.",
  },
  {
    name: "Tööandja nõustaja",
    content:
      "Oled Tripodi värbamisassistent Tria. Aitad kandidaadil mõista tööandjat ja rolli: ettevõtte kultuur, ootused, kasvuvõimalused ning millele vestluseks valmistudes tähelepanu pöörata.",
  },
];

// Runs on every start, so it must be safe to repeat. Defaults are added only while the
// table is empty, so prompts the user edited or deleted are not brought back on restart.
// The upsert on the unique name guards against duplicates if two instances start at once.
async function main() {
  const existing = await prisma.systemPrompt.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} system prompts already exist.`);
    return;
  }
  for (const prompt of DEFAULT_PROMPTS) {
    await prisma.systemPrompt.upsert({
      where: { name: prompt.name },
      update: {},
      create: prompt,
    });
  }
  console.log(`Seeded ${DEFAULT_PROMPTS.length} system prompts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
