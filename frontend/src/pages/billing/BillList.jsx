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

export default function BillList() {
  const { flashError } = useFlash();
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ q: '', status: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/billing', { params: { ...filters, page } });
      setBills(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load bills.'));
    } finally {
      setLoading(false);
    }
  }, [filters, page, flashError]);

  useEffect(() => { load(); }, [load]);

  return (
    <Card
      title="All bills"
      icon="bi-receipt"
      bodyClassName="p-0"
      actions={
        <>
          <SearchBar
            placeholder="Search patient..."
            initialQuery={filters.q}
            statuses={['Paid', 'Pending']}
            initialStatus={filters.status}
            statusAllLabel="All"
            onSearch={({ q, status }) => { setFilters({ q, status }); setPage(1); }}
          />
          <Link to="/billing/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> Create bill
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
        <Loader label="Loading bills..." />
      ) : bills.length === 0 ? (
        <EmptyState icon="bi-receipt" message="No bills found." />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Service</th><th>Amount</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
                  <td>{formatDate(b.bill_date)}</td>
                  <td>{b.patient_name}</td>
                  <td>{b.service}</td>
                  <td>{formatCurrency(b.amount)}</td>
                  <td><StatusBadge status={b.payment_status} /></td>
                  <td className="text-end">
                    <Link to={`/billing/${b.id}`} className="btn btn-sm app-btn-outline" title="View">
                      <i className="bi bi-eye" />
                    </Link>{' '}
                    <Link to={`/billing/${b.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
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
