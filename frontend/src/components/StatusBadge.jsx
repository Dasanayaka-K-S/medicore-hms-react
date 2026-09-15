/** Port of statusBadge() from the PHP helpers - same status-to-colour map. */
const BADGE_CLASSES = {
  Active: 'success',
  Inactive: 'secondary',
  Scheduled: 'info',
  Completed: 'success',
  Cancelled: 'danger',
  Pending: 'warning',
  Requested: 'secondary',
  'Sample Collected': 'info',
  Processing: 'warning',
  Available: 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
  Expired: 'danger',
  Paid: 'success',
};

export default function StatusBadge({ status }) {
  if (!status) return <span>-</span>;
  return <span className={`badge bg-${BADGE_CLASSES[status] || 'secondary'}`}>{status}</span>;
}
