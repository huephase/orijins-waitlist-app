document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-waitlist]');
  if (!root) return;

  const warningMinutes = Number(root.getAttribute('data-warning-minutes') || 5);
  const pollingInterval = Number(root.getAttribute('data-polling-interval') || 30000);
  const classes = ['status-upcoming', 'status-now', 'status-overdue', 'status-seated', 'status-noshow', 'status-cancelled'];

  const classify = (row) => {
    const status = row.getAttribute('data-status');
    if (status === 'SEATED') return 'status-seated';
    if (status === 'NO_SHOW') return 'status-noshow';
    if (status === 'CANCELLED') return 'status-cancelled';

    const scheduled = Date.parse(row.getAttribute('data-scheduled-seat-at'));
    const diff = scheduled - Date.now();
    if (Math.abs(diff) <= 30000) return 'status-now';
    if (diff < 0) return 'status-overdue';
    if (diff <= warningMinutes * 60000) return 'status-upcoming';
    return '';
  };

  const refreshRows = () => {
    root.querySelectorAll('tr[data-scheduled-seat-at]').forEach((row) => {
      row.classList.remove(...classes);
      const nextClass = classify(row);
      if (nextClass) row.classList.add(nextClass);
    });
  };

  refreshRows();
  window.setInterval(refreshRows, pollingInterval);
});
