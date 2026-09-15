import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import { toDateInput } from '../../utils/format.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMPTY = {
  full_name: '', nic: '', dob: '', gender: 'Male', phone: '',
  email: '', address: '', blood_group: '', emergency_contact: '',
};

/** Handles both "Add patient" and "Edit patient" (add.php + edit.php). */
export default function PatientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/patients/${id}`)
      .then(({ data }) => setForm({ ...EMPTY, ...data.data, dob: toDateInput(data.data.dob) }))
      .catch((err) => {
        flashError(getErrorMessage(err, 'Patient not found.'));
        navigate('/patients');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, flashError]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, form);
        flashSuccess('Patient updated successfully.');
      } else {
        await api.post('/patients', form);
        flashSuccess('Patient added successfully.');
      }
      navigate('/patients');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this patient.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading patient..." />;

  return (
    <Card title={isEdit ? `Edit patient #${id}` : 'Add patient'} icon={isEdit ? 'bi-pencil-square' : 'bi-person-plus'}>
      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Full name *</label>
            <input type="text" className="form-control" value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">NIC *</label>
            <input type="text" className="form-control" value={form.nic}
              onChange={(e) => update('nic', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date of birth *</label>
            <input type="date" className="form-control" value={form.dob}
              onChange={(e) => update('dob', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Gender *</label>
            <select className="form-select" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
              {['Male', 'Female', 'Other'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Blood group</label>
            <select className="form-select" value={form.blood_group || ''} onChange={(e) => update('blood_group', e.target.value)}>
              <option value="">-- Select --</option>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone *</label>
            <input type="text" className="form-control" value={form.phone}
              onChange={(e) => update('phone', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email || ''}
              onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Emergency contact</label>
            <input type="text" className="form-control" value={form.emergency_contact || ''}
              onChange={(e) => update('emergency_contact', e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Address</label>
            <textarea className="form-control" rows="2" value={form.address || ''}
              onChange={(e) => update('address', e.target.value)} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update patient' : 'Save patient'}
          </button>
          <Link to="/patients" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
