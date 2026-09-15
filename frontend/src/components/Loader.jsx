export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="empty-state">
      <div className="spinner-border text-info mb-2" role="status" aria-hidden="true" />
      <p className="mb-0">{label}</p>
    </div>
  );
}
