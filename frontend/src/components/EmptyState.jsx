export default function EmptyState({ icon = 'bi-inbox', message = 'Nothing to show yet.' }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <p className="mb-0">{message}</p>
    </div>
  );
}
