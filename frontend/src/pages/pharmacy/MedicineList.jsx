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
import { formatDate, formatCurrency } from '../../utils/format.js';

export default function MedicineList() {
  const { flashSuccess, flashError } = useFlash();
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [alertCount, setAlertCount] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pharmacy', { params: { q: query, page } });
      setMedicines(data.data);
      setPagination(data.pagination);
      setAlertCount(data.alertCount);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load the medicine inventory.'));
    } finally {
      setLoading(false);
    }
  }, [query, page, flashError]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(med) {
    if (!window.confirm(`Are you sure you want to delete "${med.medicine_name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/pharmacy/${med.id}`);
      flashSuccess('Medicine deleted successfully.');
      load();
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to delete this medicine.'));
    }
  }

  return (
    <>
      {alertCount > 0 && (
        <div className="alert alert-warning app-alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {alertCount} medicine(s) need attention (low stock, out of stock, or expired).
        </div>
      )}

      <Card
        title="Medicine inventory"
        icon="bi-capsule"
        bodyClassName="p-0"
        actions={
          <>
            <SearchBar
              placeholder="Search medicine or category..."
              initialQuery={query}
              onSearch={({ q }) => { setQuery(q); setPage(1); }}
            />
            <Link to="/pharmacy/new" className="btn app-btn-primary btn-sm">
              <i className="bi bi-plus-lg" /> Add medicine
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
          <Loader label="Loading inventory..." />
        ) : medicines.length === 0 ? (
          <EmptyState icon="bi-capsule" message="No medicines found." />
        ) : (
          <div className="table-responsive">
            <table className="table app-table mb-0">
              <thead>
                <tr>
                  <th>Medicine</th><th>Category</th><th>Quantity</th><th>Unit Price</th>
                  <th>Expiry Date</th><th>Supplier</th><th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m.id}>
                    <td>{m.medicine_name}</td>
                    <td>{m.category || '-'}</td>
                    <td>{m.quantity}</td>
                    <td>{formatCurrency(m.unit_price)}</td>
                    <td>{formatDate(m.expiry_date)}</td>
                    <td>{m.supplier || '-'}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="text-end">
                      <Link to={`/pharmacy/${m.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit / update stock">
                        <i className="bi bi-pencil" />
                      </Link>{' '}
                      <button type="button" className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(m)}>
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
    </>
  );
}
