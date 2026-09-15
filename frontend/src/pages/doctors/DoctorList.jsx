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

export default function DoctorList() {
  const { flashSuccess, flashError } = useFlash();
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors', { params: { q: query, page } });
      setDoctors(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load doctors.'));
    } finally {
      setLoading(false);
    }
  }, [query, page, flashError]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(doctor) {
    if (!window.confirm(`Are you sure you want to delete "${doctor.full_name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/doctors/${doctor.id}`);
      flashSuccess('Doctor deleted successfully.');
      load();
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to delete this doctor.'));
    }
  }

  return (
    <Card
      title="All doctors"
      icon="bi-person-badge"
      bodyClassName="p-0"
      actions={
        <>
          <SearchBar
            placeholder="Search name or specialization..."
            initialQuery={query}
            onSearch={({ q }) => { setQuery(q); setPage(1); }}
          />
          <Link to="/doctors/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> Add doctor
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
        <Loader label="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyState icon="bi-person-badge" message={query ? `No doctors found for "${query}".` : 'No doctors added yet.'} />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Full Name</th><th>Specialization</th><th>Department</th>
                <th>Phone</th><th>Available Days</th><th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>#{d.id}</td>
                  <td>{d.full_name}</td>
                  <td>{d.specialization}</td>
                  <td>{d.department_name || '-'}</td>
                  <td>{d.phone}</td>
                  <td>{d.available_days || '-'}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="text-end">
                    <Link to={`/doctors/${d.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
                      <i className="bi bi-pencil" />
                    </Link>{' '}
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(d)}>
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
