import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from './services/prisma';
import { sanitizeEmail } from './utils/sanitize';

async function main() {
  const email = sanitizeEmail(process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com');
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.SEED_ADMIN_NAME ?? 'Super Admin';

  await prisma.user.upsert({
    where: { email },
    update: { name, role: 'SUPER_ADMIN', isActive: true },
    create: {
      email,
      name,
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  console.log(`Seeded super admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
