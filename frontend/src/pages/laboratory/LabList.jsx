import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

const STATUSES = ['Requested', 'Sample Collected', 'Processing', 'Completed'];

export default function LabList() {
  const { flashError } = useFlash();
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/laboratory', { params: { status, page } });
      setTests(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load laboratory tests.'));
    } finally {
      setLoading(false);
    }
  }, [status, page, flashError]);

  useEffect(() => { load(); }, [load]);

  return (
    <Card
      title="Laboratory test requests"
      icon="bi-clipboard2-pulse"
      bodyClassName="p-0"
      actions={
        <>
          {/* The original page filtered by status only - no free-text search. */}
          <SearchBar
            showSearchInput={false}
            statuses={STATUSES}
            initialStatus={status}
            onSearch={({ status: s }) => { setStatus(s); setPage(1); }}
          />
          <Link to="/laboratory/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> New test request
          </Link>
        </>
      }
      footer={
        pagination.totalPages > 1 && (
          <Pagination page={pagination.currentPage} totalPages={pagination.totalPages} onChange={setPage} />
        )
      }
    >
      {loading ? (
        <Loader label="Loading test requests..." />
      ) : tests.length === 0 ? (
        <EmptyState icon="bi-clipboard2-pulse" message="No laboratory test requests found." />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Test Name</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.test_date)}</td>
                  <td>{t.patient_name}</td>
                  <td>{t.doctor_name || '-'}</td>
                  <td>{t.test_name}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="text-end">
                    <Link to={`/laboratory/${t.id}/edit`} className="btn btn-sm app-btn-outline" title="Update result / status">
                      <i className="bi bi-pencil" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
