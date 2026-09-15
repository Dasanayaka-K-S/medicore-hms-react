import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import { formatDate } from '../../utils/format.js';

function Detail({ label, value, className = 'col-md-4' }) {
  return (
    <div className={className}>
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value || '-'}</div>
    </div>
  );
}

export default function RecordView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { flashError } = useFlash();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    api.get(`/medical-records/${id}`)
      .then(({ data }) => setRecord(data.data))
      .catch((err) => {
        flashError(getErrorMessage(err, 'Medical record not found.'));
        navigate('/medical-records');
      });
  }, [id, navigate, flashError]);

  if (!record) return <Loader label="Loading record..." />;

  return (
    <Card
      title={`Medical record - ${record.patient_name}`}
      icon="bi-file-earmark-medical"
      actions={
        <>
          <Link to={`/medical-records/${id}/edit`} className="btn btn-sm app-btn-outline">
            <i className="bi bi-pencil" /> Edit
          </Link>
          <Link to="/medical-records" className="btn btn-sm app-btn-outline">Back</Link>
        </>
      }
    >
      <div className="row g-4">
        <Detail label="Patient" value={record.patient_name} />
        <Detail label="Doctor" value={record.doctor_name} />
        <Detail label="Date" value={formatDate(record.record_date)} />
        <Detail label="Diagnosis" value={record.diagnosis} className="col-md-6" />
        <Detail label="Treatment" value={record.treatment} className="col-md-6" />
        <Detail label="Prescription" value={record.prescription} className="col-md-6" />
        <Detail label="Notes" value={record.notes} className="col-12" />
      </div>
    </Card>
  );
}
