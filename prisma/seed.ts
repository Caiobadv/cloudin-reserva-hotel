import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const recepcaoPasswordHash = await bcrypt.hash("recepcao123", 10);

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cloudin.com" },
    update: {},
    create: {
      name: "Administrador CloudIn",
      email: "admin@cloudin.com",
      phone: "",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user created/updated:", adminUser);

  // Create or update reception user
  const recepcaoUser = await prisma.user.upsert({
    where: { email: "recepcao@cloudin.com" },
    update: {},
    create: {
      name: "Recepção Hotel",
      email: "recepcao@cloudin.com",
      phone: "",
      password: recepcaoPasswordHash,
      role: "RECEPTION",
    },
  });

  console.log("Reception user created/updated:", recepcaoUser);

  // Create or update room
  const room = await prisma.room.upsert({
    where: { id: "sala-premium-001" },
    update: {},
    create: {
      id: "sala-premium-001",
      name: "Sala Premium",
      description:
        "Sala de reunião premium com vista panorâmica, equipada com TV 65\", videoconferência, quadro branco e ar-condicionado.",
      capacity: 10,
      pricePerHour: 50.0,
      isActive: true,
    },
  });

  console.log("Room created/updated:", room);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
