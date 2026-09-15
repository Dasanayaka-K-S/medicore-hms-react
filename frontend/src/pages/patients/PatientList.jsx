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

export default function PatientList() {
  const { flashSuccess, flashError } = useFlash();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { q: query, page } });
      setPatients(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load patients.'));
    } finally {
      setLoading(false);
    }
  }, [query, page, flashError]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(patient) {
    const ok = window.confirm(
      `Are you sure you want to delete "${patient.full_name}"? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      await api.delete(`/patients/${patient.id}`);
      flashSuccess('Patient deleted successfully.');
      load();
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to delete this patient.'));
    }
  }

  return (
    <Card
      title="All patients"
      icon="bi-people"
      bodyClassName="p-0"
      actions={
        <>
          <SearchBar
            placeholder="Search name, NIC, phone..."
            initialQuery={query}
            onSearch={({ q }) => { setQuery(q); setPage(1); }}
          />
          <Link to="/patients/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> Add patient
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
        <Loader label="Loading patients..." />
      ) : patients.length === 0 ? (
        <EmptyState icon="bi-people" message={query ? `No patients found for "${query}".` : 'No patients registered yet.'} />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Full Name</th><th>NIC</th><th>Gender</th>
                <th>Phone</th><th>Blood Group</th><th>Registered</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.full_name}</td>
                  <td>{p.nic}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.blood_group || '-'}</td>
                  <td>{formatDate(p.created_at)}</td>
                  <td className="text-end">
                    <Link to={`/patients/${p.id}`} className="btn btn-sm app-btn-outline" title="View">
                      <i className="bi bi-eye" />
                    </Link>{' '}
                    <Link to={`/patients/${p.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
                      <i className="bi bi-pencil" />
                    </Link>{' '}
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(p)}>
                      <i className="bi bi-trash" />
                    </button>
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
