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

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { flashError } = useFlash();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`)
      .then(({ data }) => setPatient(data.data))
      .catch((err) => {
        flashError(getErrorMessage(err, 'Patient not found.'));
        navigate('/patients');
      });
  }, [id, navigate, flashError]);

  if (!patient) return <Loader label="Loading patient..." />;

  return (
    <Card
      title={patient.full_name}
      icon="bi-person-lines-fill"
      actions={
        <>
          <Link to={`/patients/${id}/edit`} className="btn btn-sm app-btn-outline">
            <i className="bi bi-pencil" /> Edit
          </Link>
          <Link to="/patients" className="btn btn-sm app-btn-outline">Back</Link>
        </>
      }
    >
      <div className="row g-4">
        <Detail label="Patient ID" value={`#${patient.id}`} />
        <Detail label="NIC" value={patient.nic} />
        <Detail label="Date of birth" value={formatDate(patient.dob)} />
        <Detail label="Gender" value={patient.gender} />
        <Detail label="Blood group" value={patient.blood_group} />
        <Detail label="Phone" value={patient.phone} />
        <Detail label="Email" value={patient.email} />
        <Detail label="Emergency contact" value={patient.emergency_contact} />
        <Detail label="Registered on" value={formatDate(patient.created_at)} />
        <Detail label="Address" value={patient.address} className="col-12" />
      </div>
    </Card>
  );
}
