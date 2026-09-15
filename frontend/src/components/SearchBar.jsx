import { useState } from 'react';

/**
 * Search box (+ optional status dropdown) used by the list pages.
 * Submitting mirrors the GET-form behaviour of the original PHP pages.
 */
export default function SearchBar({
  placeholder = 'Search...',
  initialQuery = '',
  statuses,
  initialStatus = '',
  statusAllLabel = 'All Statuses',
  showSearchInput = true,
  onSearch,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch({ q: query, status });
  }

  return (
    <form className="d-flex gap-2" onSubmit={handleSubmit}>
      {showSearchInput && (
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {statuses && (
        <select
          className="form-select form-select-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{statusAllLabel}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      <button className="btn btn-sm app-btn-outline" type="submit" aria-label="Search">
        <i className="bi bi-search" />
      </button>
    </form>
  );
}
