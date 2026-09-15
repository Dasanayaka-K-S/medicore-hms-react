import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/format.js';

function Detail({ label, value, className = 'col-md-4' }) {
  return (
    <div className={className}>
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value || '-'}</div>
    </div>
  );
}

export default function BillView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { flashError } = useFlash();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    api.get(`/billing/${id}`)
      .then(({ data }) => setBill(data.data))
      .catch((err) => {
        flashError(getErrorMessage(err, 'Bill not found.'));
        navigate('/billing');
      });
  }, [id, navigate, flashError]);

  if (!bill) return <Loader label="Loading bill..." />;

  return (
    <Card
      title={`Bill #${bill.id}`}
      icon="bi-receipt"
      actions={
        <>
          <Link to={`/billing/${id}/edit`} className="btn btn-sm app-btn-outline">
            <i className="bi bi-pencil" /> Edit
          </Link>
          <Link to="/billing" className="btn btn-sm app-btn-outline">Back</Link>
        </>
      }
    >
      <div className="row g-4">
        <Detail label="Patient" value={bill.patient_name} />
        <Detail label="Phone" value={bill.patient_phone} />
        <Detail label="Bill date" value={formatDate(bill.bill_date)} />
        <Detail label="Service" value={bill.service} />
        <Detail label="Amount" value={<span className="fw-bold">{formatCurrency(bill.amount)}</span>} />
        <Detail label="Payment status" value={<StatusBadge status={bill.payment_status} />} />
        <Detail label="Description" value={bill.description} className="col-12" />
      </div>
    </Card>
  );
}
