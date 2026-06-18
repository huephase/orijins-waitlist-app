import type { RequestHandler } from 'express';
import { getReportData } from '../services/reportService';
import { formatUaeDateTime } from '../utils/dateUtils';

export const showReports: RequestHandler = async (_req, res, next) => {
  try {
    res.render('pages/reports.njk', {
      ...(await getReportData()),
      formatUaeDateTime,
    });
  } catch (error) {
    next(error);
  }
};
