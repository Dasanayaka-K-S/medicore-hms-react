/**
 * Display formatting helpers - ports of formatDate(), formatTime() and
 * formatCurrency() from the PHP includes/functions.php.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-15" -> "15 Sep 2026" */
export function formatDate(value) {
  if (!value) return '-';
  const datePart = String(value).split(' ')[0];
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return '-';
  return `${d} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

/** "14:30:00" -> "02:30 PM" */
export function formatTime(value) {
  if (!value) return '-';
  const [hStr, min] = String(value).split(':');
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return '-';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${min} ${ampm}`;
}

/** 2500 -> "Rs. 2,500.00" */
export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Normalises a DB date/datetime into the yyyy-mm-dd an <input type="date"> needs. */
export function toDateInput(value) {
  if (!value) return '';
  return String(value).split(' ')[0];
}

/** Normalises a DB time into the HH:MM an <input type="time"> needs. */
export function toTimeInput(value) {
  if (!value) return '';
  const [h, m] = String(value).split(':');
  return h && m ? `${h}:${m}` : '';
}
