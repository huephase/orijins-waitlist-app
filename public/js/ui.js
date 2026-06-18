document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  toggle?.addEventListener('click', () => nav?.classList.toggle('is-open'));

  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm') || 'Continue?';
      if (!window.confirm(message)) event.preventDefault();
    });
  });

  const confirmDialog = document.querySelector('[data-confirm-dialog]');
  const confirmTitle = document.querySelector('[data-confirm-dialog-title]');
  const confirmMessage = document.querySelector('[data-confirm-dialog-message]');
  const confirmCancel = document.querySelector('[data-confirm-dialog-cancel]');
  const confirmButton = document.querySelector('[data-confirm-dialog-confirm]');
  let pendingConfirmForm = null;

  const hideConfirmDialog = () => {
    if (confirmDialog) confirmDialog.hidden = true;
    pendingConfirmForm = null;
  };

  document.querySelectorAll('form[data-confirm-modal]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      pendingConfirmForm = form;
      if (confirmTitle) confirmTitle.textContent = form.getAttribute('data-confirm-title') || 'Confirm action';
      if (confirmMessage) confirmMessage.textContent = form.getAttribute('data-confirm-message') || 'Continue?';
      if (confirmDialog) confirmDialog.hidden = false;
      confirmButton?.focus();
    });
  });

  confirmCancel?.addEventListener('click', hideConfirmDialog);
  confirmDialog?.addEventListener('click', (event) => {
    if (event.target === confirmDialog) hideConfirmDialog();
  });
  confirmButton?.addEventListener('click', () => {
    pendingConfirmForm?.submit();
  });

  const guestForm = document.querySelector('[data-guest-form]');
  if (!guestForm) return;

  const scheduledTime = guestForm.querySelector('[data-scheduled-time]');
  const minutesInput = guestForm.querySelector('[data-minutes-input]');
  const hourSelect = guestForm.querySelector('[data-time-hour]');
  const minuteSelect = guestForm.querySelector('[data-time-minute]');
  const periodSelect = guestForm.querySelector('[data-time-period]');
  const timeWarning = guestForm.querySelector('[data-time-warning]');
  const timeWarningClose = guestForm.querySelector('[data-time-warning-close]');

  const padTime = (value) => String(value).padStart(2, '0');

  const setTimeSelectsFromDate = (date) => {
    const hours24 = date.getHours();
    const hour12 = hours24 % 12 || 12;
    if (hourSelect) hourSelect.value = String(hour12);
    if (minuteSelect) minuteSelect.value = padTime(date.getMinutes());
    if (periodSelect) periodSelect.value = hours24 >= 12 ? 'PM' : 'AM';
  };

  const hideTimeWarning = () => {
    if (timeWarning) timeWarning.hidden = true;
  };

  const showTimeWarning = () => {
    if (timeWarning) timeWarning.hidden = false;
    timeWarningClose?.focus();
  };

  const syncScheduledTime = () => {
    if (!scheduledTime || !hourSelect || !minuteSelect || !periodSelect) return;
    const hour12 = Number(hourSelect.value);
    const hour24 =
      periodSelect.value === 'PM' ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
    scheduledTime.value = `${padTime(hour24)}:${minuteSelect.value}`;
  };

  const getSelectedTimeDate = () => {
    if (!hourSelect || !minuteSelect || !periodSelect) return new Date();
    const selected = new Date();
    const hour12 = Number(hourSelect.value);
    const hour24 =
      periodSelect.value === 'PM' ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
    selected.setHours(hour24, Number(minuteSelect.value), 0, 0);
    return selected;
  };

  const syncTimeFromMinutes = () => {
    if (!minutesInput) return;
    const minutes = Math.max(0, Number(minutesInput.value || 0));
    const target = new Date(Date.now() + minutes * 60_000);
    setTimeSelectsFromDate(target);
    syncScheduledTime();
  };

  const syncMinutesFromTime = () => {
    if (!minutesInput) return;
    const selected = getSelectedTimeDate();
    const now = new Date();
    minutesInput.value = String(Math.max(0, Math.round((selected.getTime() - now.getTime()) / 60_000)));
    syncScheduledTime();
  };

  const setTimeTwoMinutesAhead = () => {
    const target = new Date(Date.now() + 2 * 60_000);
    setTimeSelectsFromDate(target);
    if (minutesInput) minutesInput.value = '2';
    syncScheduledTime();
  };

  const setSpecificTimeToNow = () => {
    setTimeSelectsFromDate(new Date());
    if (minutesInput) minutesInput.value = '0';
    syncScheduledTime();
  };

  const syncSeatFields = () => {
    const mode = guestForm.querySelector('input[name="seatingMode"]:checked')?.value;
    const minutes = guestForm.querySelector('[data-minutes-field]');
    const time = guestForm.querySelector('[data-time-field]');
    if (minutes) minutes.hidden = mode !== 'minutes';
    if (time) time.hidden = mode !== 'specific';
    if (mode === 'specific') {
      setSpecificTimeToNow();
      syncScheduledTime();
    }
  };

  guestForm.querySelectorAll('input[name="seatingMode"]').forEach((input) => {
    input.addEventListener('change', syncSeatFields);
  });
  minutesInput?.addEventListener('input', () => {
    hideTimeWarning();
    syncTimeFromMinutes();
  });
  [hourSelect, minuteSelect, periodSelect].forEach((input) => {
    input?.addEventListener('change', () => {
      hideTimeWarning();
      syncMinutesFromTime();
    });
  });
  timeWarningClose?.addEventListener('click', hideTimeWarning);
  timeWarning?.addEventListener('click', (event) => {
    if (event.target === timeWarning) hideTimeWarning();
  });
  guestForm.addEventListener('submit', (event) => {
    const mode = guestForm.querySelector('input[name="seatingMode"]:checked')?.value;
    if (mode !== 'specific') return;

    const selected = getSelectedTimeDate();
    if (selected.getTime() > Date.now()) return;

    event.preventDefault();
    setTimeTwoMinutesAhead();
    showTimeWarning();
  });
  syncTimeFromMinutes();
  syncSeatFields();
});
