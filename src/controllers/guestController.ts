import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { GuestStatus } from '@prisma/client';
import { loadConfig } from '../config/loadConfig';
import { createGuest, getGuest, listGuests, updateGuest, changeGuestStatus } from '../services/guestService';
import { formatUaeDateTime } from '../utils/dateUtils';
import { getColorStatus } from '../utils/colorStatus';

const config = loadConfig();

export const showWaitlist: RequestHandler = async (_req, res, next) => {
  try {
    const guests = await listGuests();
    res.render('pages/waitlist.njk', {
      guests,
      formatUaeDateTime,
      getColorStatus: (status: GuestStatus, scheduledSeatAt: Date) =>
        getColorStatus(status, scheduledSeatAt, config.waitlist.warning_minutes_before),
    });
  } catch (error) {
    next(error);
  }
};

export const waitlistJson: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await listGuests());
  } catch (error) {
    next(error);
  }
};

export const showAddGuest: RequestHandler = (req, res) => {
  res.render('pages/addGuest.njk', { seatingMode: req.session.seatingMode ?? config.waitlist.default_seating_mode });
};

export const addGuest: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    req.session.seatingMode = req.body.seatingMode;
    if (!errors.isEmpty()) {
      res.status(422).render('pages/addGuest.njk', { errors: errors.array(), form: req.body, seatingMode: req.body.seatingMode });
      return;
    }
    await createGuest(req.body, req.session.user!.userId);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

export const showEditGuest: RequestHandler = async (req, res, next) => {
  try {
    const guest = await getGuest(String(req.params.id));
    if (!guest) {
      res.status(404).render('errors/404.njk');
      return;
    }
    res.render('pages/editGuest.njk', { guest, seatingMode: req.session.seatingMode ?? 'minutes' });
  } catch (error) {
    next(error);
  }
};

export const editGuest: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    req.session.seatingMode = req.body.seatingMode;
    if (!errors.isEmpty()) {
      res.status(422).render('pages/editGuest.njk', { errors: errors.array(), form: req.body, guest: { id: String(req.params.id) } });
      return;
    }
    await updateGuest(String(req.params.id), req.body, req.session.user!.userId);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

export const setGuestStatus: RequestHandler = async (req, res, next) => {
  try {
    const statusMap: Record<string, GuestStatus> = {
      seated: GuestStatus.SEATED,
      noshow: GuestStatus.NO_SHOW,
      cancelled: GuestStatus.CANCELLED,
    };
    const status = statusMap[String(req.params.status)];
    if (!status) {
      res.status(404).render('errors/404.njk');
      return;
    }
    await changeGuestStatus(String(req.params.id), status, req.session.user!.userId);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};
