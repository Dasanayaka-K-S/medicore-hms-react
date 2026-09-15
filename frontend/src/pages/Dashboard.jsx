import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate, formatTime, formatCurrency } from '../utils/format.js';

/** The six summary cards from the original dashboard.php, in the same order. */
function statCards(stats) {
  return [
    { label: 'Total Patients', value: stats.totalPatients, icon: 'bi-people', bg: 'bg-teal' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: 'bi-person-badge', bg: 'bg-navy' },
    { label: "Today's Appointments", value: stats.todaysAppts, icon: 'bi-calendar-check', bg: 'bg-info' },
    { label: 'Pending Lab Tests', value: stats.pendingLabTests, icon: 'bi-clipboard2-pulse', bg: 'bg-warning' },
    { label: 'Pharmacy Alerts', value: stats.stockAlerts, icon: 'bi-capsule', bg: 'bg-danger' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: 'bi-cash-coin', bg: 'bg-success' },
  ];
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/dashboard')
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => { if (active) setError(getErrorMessage(err, 'Unable to load dashboard data.')); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="alert alert-danger app-alert">{error}</div>;
  if (!data) return <Loader label="Loading dashboard..." />;

  return (
    <>
      <div className="row g-3 mb-4">
        {statCards(data.stats).map((c) => (
          <div className="col-6 col-md-4 col-xl-2" key={c.label}>
            <div className="stat-card">
              <div className={`stat-icon ${c.bg}`}><i className={`bi ${c.icon}`} /></div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Card title="Today's appointments" icon="bi-calendar-check" bodyClassName="p-0">
            {data.todaysAppointments.length === 0 ? (
              <EmptyState icon="bi-calendar-x" message="No appointments scheduled for today." />
            ) : (
              <div className="table-responsive">
                <table className="table app-table mb-0">
                  <thead>
                    <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.todaysAppointments.map((a) => (
                      <tr key={a.id}>
                        <td>{formatTime(a.appointment_time)}</td>
                        <td>{a.patient_name}</td>
                        <td>{a.doctor_name}</td>
                        <td><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="col-lg-5">
          <Card title="Recent patients" icon="bi-person-plus" bodyClassName="p-0">
            {data.recentPatients.length === 0 ? (
              <EmptyState icon="bi-people" message="No patients registered yet." />
            ) : (
              <ul className="list-group list-group-flush">
                {data.recentPatients.map((p) => (
                  <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{p.full_name}</div>
                      <div className="text-muted small">{p.phone}</div>
                    </div>
                    <span className="text-muted small">{formatDate(p.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
