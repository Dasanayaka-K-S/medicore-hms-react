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
import { formatDate, formatTime } from '../../utils/format.js';

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Pending'];

export default function AppointmentList() {
  const { flashSuccess, flashError } = useFlash();
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ q: '', status: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', { params: { ...filters, page } });
      setAppointments(data.data);
      setPagination(data.pagination);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load appointments.'));
    } finally {
      setLoading(false);
    }
  }, [filters, page, flashError]);

  useEffect(() => { load(); }, [load]);

  /** Soft cancel - the original app changed status, it never deleted the row. */
  async function handleCancel(appt) {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${appt.id}/cancel`);
      flashSuccess('Appointment cancelled.');
      load();
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to cancel this appointment.'));
    }
  }

  return (
    <Card
      title="All appointments"
      icon="bi-calendar-check"
      bodyClassName="p-0"
      actions={
        <>
          <SearchBar
            placeholder="Search patient or doctor..."
            initialQuery={filters.q}
            statuses={STATUSES}
            initialStatus={filters.status}
            onSearch={({ q, status }) => { setFilters({ q, status }); setPage(1); }}
          />
          <Link to="/appointments/new" className="btn app-btn-primary btn-sm">
            <i className="bi bi-plus-lg" /> New appointment
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
        <Loader label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState icon="bi-calendar-x" message="No appointments found." />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr>
                <th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th>
                <th>Department</th><th>Reason</th><th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.appointment_date)}</td>
                  <td>{formatTime(a.appointment_time)}</td>
                  <td>{a.patient_name}</td>
                  <td>{a.doctor_name}</td>
                  <td>{a.department_name || '-'}</td>
                  <td>{a.reason || '-'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-end">
                    <Link to={`/appointments/${a.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
                      <i className="bi bi-pencil" />
                    </Link>{' '}
                    {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        title="Cancel appointment" onClick={() => handleCancel(a)}>
                        <i className="bi bi-x-circle" />
                      </button>
                    )}
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
