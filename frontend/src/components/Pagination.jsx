/** Numbered pager matching renderPagination() in the PHP app. */
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-sm mb-0">
        {pages.map((n) => (
          <li key={n} className={`page-item ${n === page ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onChange(n)}>
              {n}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
