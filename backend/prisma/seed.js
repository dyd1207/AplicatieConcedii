require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });


async function main() {
  const roles = [
    { code: "ANGAJAT", name: "Angajat" },
    { code: "SECRETARIAT", name: "Secretariat" },
    { code: "SEF_STRUCTURA", name: "Șef structură" },
    { code: "DIRECTOR_ADJUNCT", name: "Director adjunct" },
    { code: "DIRECTOR", name: "Director" },
    { code: "ADMINISTRATOR", name: "Administrator" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: role,
    });
  }

  const defaultPassword = "1207";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const director = await prisma.user.upsert({
    where: { username: "director" },
    update: {
      email: "director@institutie.local",
      fullName: "Director",
      isActive: true,
    },
    create: {
      username: "director",
      email: "director@institutie.local",
      fullName: "Director",
      password: passwordHash,
      isActive: true,
    },
  });

  const directorAdjunct = await prisma.user.upsert({
    where: { username: "director.adjunct" },
    update: {
      email: "director.adjunct@institutie.local",
      fullName: "Director Adjunct",
      isActive: true,
    },
    create: {
      username: "director.adjunct",
      email: "director.adjunct@institutie.local",
      fullName: "Director Adjunct",
      password: passwordHash,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@institutie.local",
      fullName: "Administrator",
      isActive: true,
    },
    create: {
      username: "admin",
      email: "admin@institutie.local",
      fullName: "Administrator",
      password: passwordHash,
      isActive: true,
    },
  });

  await assignRoles(director.id, ["DIRECTOR"]);
  await assignRoles(directorAdjunct.id, ["DIRECTOR_ADJUNCT"]);
  await assignRoles(admin.id, ["ADMINISTRATOR", "SECRETARIAT"]);

  // setăm înlocuitorul Directorului = Director Adjunct
  await prisma.user.update({
    where: { id: director.id },
    data: { substituteId: directorAdjunct.id },
  });

  console.log("✅ Seed complet:");
  console.log("- Roluri:", roles.map(r => r.code).join(", "));
  console.log("- User director:", director.username);
  console.log("- User director.adjunct:", directorAdjunct.username);
  console.log("- User admin:", admin.username);
  console.log("Parola initiala (toți):", defaultPassword);
}

async function assignRoles(userId, roleCodes) {
  const roleRows = await prisma.role.findMany({
    where: { code: { in: roleCodes } },
    select: { id: true },
  });

  for (const role of roleRows) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });