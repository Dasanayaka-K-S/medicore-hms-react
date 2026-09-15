import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import { formatDate } from '../../utils/format.js';

export default function RecordList() {
  const { flashError } = useFlash();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/medical-records', { params: { q: query, page } });
      setRecords(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load medical records.'));
    } finally {
      setLoading(false);
    }
  }, [query, page, flashError]);

  useEffect(() => { load(); }, [load]);

  return (
    <Card
      title="Medical records"
      icon="bi-file-earmark-medical"
      bodyClassName="p-0"
      actions={
        <>
          <SearchBar
            placeholder="Search patient or diagnosis..."
            initialQuery={query}
            onSearch={({ q }) => { setQuery(q); setPage(1); }}
          />
          <Link to="/medical-records/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> Add record
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
        <Loader label="Loading records..." />
      ) : records.length === 0 ? (
        <EmptyState icon="bi-file-earmark-medical" message="No medical records found." />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Treatment</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.record_date)}</td>
                  <td>{r.patient_name}</td>
                  <td>{r.doctor_name}</td>
                  <td>{r.diagnosis}</td>
                  <td>{r.treatment || '-'}</td>
                  <td className="text-end">
                    <Link to={`/medical-records/${r.id}`} className="btn btn-sm app-btn-outline" title="View">
                      <i className="bi bi-eye" />
                    </Link>{' '}
                    <Link to={`/medical-records/${r.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
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
