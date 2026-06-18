import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './services/prisma';
import { startScheduler } from './services/schedulerService';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();
const server = app.listen(port, () => {
  console.log(`Waitlist app listening on http://localhost:${port}`);
});

startScheduler();

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
