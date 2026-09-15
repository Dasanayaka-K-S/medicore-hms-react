import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY = {
  full_name: '', specialization: '', department_id: '', phone: '',
  email: '', available_days: [], status: 'Active',
};

export default function DoctorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState(EMPTY);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const deptRes = await api.get('/lookups/departments');
        setDepartments(deptRes.data.data);

        if (isEdit) {
          const { data } = await api.get(`/doctors/${id}`);
          const d = data.data;
          setForm({
            ...EMPTY,
            ...d,
            department_id: d.department_id ?? '',
            // available_days is stored as a comma-separated string in MySQL
            available_days: d.available_days ? d.available_days.split(',') : [],
          });
        }
      } catch (err) {
        flashError(getErrorMessage(err, 'Unable to load this doctor.'));
        navigate('/doctors');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEdit, navigate, flashError]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter((d) => d !== day)
        : [...f.available_days, day],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/doctors/${id}`, form);
        flashSuccess('Doctor updated successfully.');
      } else {
        await api.post('/doctors', form);
        flashSuccess('Doctor added successfully.');
      }
      navigate('/doctors');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this doctor.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  return (
    <Card title={isEdit ? `Edit doctor #${id}` : 'Add doctor'} icon={isEdit ? 'bi-pencil-square' : 'bi-person-plus'}>
      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Full name *</label>
            <input type="text" className="form-control" value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Specialization *</label>
            <input type="text" className="form-control" value={form.specialization}
              onChange={(e) => update('specialization', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department_id ?? ''}
              onChange={(e) => update('department_id', e.target.value)}>
              <option value="">-- Select department --</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
          <div className="col-12">
            <label className="form-label">Available days</label>
            <div className="d-flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <div className="form-check" key={day}>
                  <input className="form-check-input" type="checkbox" id={`day-${day}`}
                    checked={form.available_days.includes(day)} onChange={() => toggleDay(day)} />
                  <label className="form-check-label" htmlFor={`day-${day}`}>{day}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update doctor' : 'Save doctor'}
          </button>
          <Link to="/doctors" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
