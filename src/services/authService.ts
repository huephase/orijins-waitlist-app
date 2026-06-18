import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { sanitizeEmail } from '../utils/sanitize';

export async function verifyLogin(email: string, password: string) {
  const normalizedEmail = sanitizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.isActive) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
}
