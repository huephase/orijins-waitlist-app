import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { loadConfig } from '../config/loadConfig';
import { getReportData } from './reportService';

export function startScheduler() {
  const config = loadConfig();

  cron.schedule(config.scheduler.daily_report_cron, async () => {
    const recipient = process.env.REPORT_RECIPIENT_EMAIL;
    if (!recipient || !process.env.SMTP_HOST) return;

    const report = await getReportData();
    if (report.totals.total === 0) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });

    await transporter.sendMail({
      to: recipient,
      from: process.env.SMTP_USER ?? 'waitlist@localhost',
      subject: `${config.app.name} daily report`,
      text: `Total: ${report.totals.total}\nSeated: ${report.totals.seated}\nNo-shows: ${report.totals.noShows}\nCancellations: ${report.totals.cancellations}\nAverage wait: ${report.totals.averageWaitMinutes} minutes`,
    });
  });
}
