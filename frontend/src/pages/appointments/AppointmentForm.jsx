import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import { toDateInput, toTimeInput } from '../../utils/format.js';

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Pending'];

const EMPTY = {
  patient_id: '', doctor_id: '', department_id: '',
  appointment_date: '', appointment_time: '', reason: '', status: 'Scheduled',
};

export default function AppointmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState(EMPTY);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // When adding, the original only offered Active doctors.
        // When editing, all doctors are listed so an existing (now
        // inactive) doctor still appears correctly in the dropdown.
        const [pRes, dRes, deptRes] = await Promise.all([
          api.get('/lookups/patients'),
          api.get('/lookups/doctors', { params: isEdit ? {} : { activeOnly: '1' } }),
          api.get('/lookups/departments'),
        ]);
        setPatients(pRes.data.data);
        setDoctors(dRes.data.data);
        setDepartments(deptRes.data.data);

        if (isEdit) {
          const { data } = await api.get(`/appointments/${id}`);
          const a = data.data;
          setForm({
            ...EMPTY,
            ...a,
            department_id: a.department_id ?? '',
            appointment_date: toDateInput(a.appointment_date),
            appointment_time: toTimeInput(a.appointment_time),
            reason: a.reason || '',
          });
        }
      } catch (err) {
        flashError(getErrorMessage(err, 'Unable to load this appointment.'));
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    }
    init();
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
        await api.put(`/appointments/${id}`, form);
        flashSuccess('Appointment updated successfully.');
      } else {
        await api.post('/appointments', form);
        flashSuccess('Appointment created successfully.');
      }
      navigate('/appointments');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this appointment.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  const missingPrerequisites = !isEdit && (patients.length === 0 || doctors.length === 0);

  return (
    <Card title={isEdit ? `Edit appointment #${id}` : 'New appointment'} icon={isEdit ? 'bi-pencil-square' : 'bi-calendar-plus'}>
      <FormErrors errors={errors} />

      {missingPrerequisites && (
        <div className="alert alert-warning app-alert">
          You need at least one patient and one active doctor before creating an appointment.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Patient *</label>
            <select className="form-select" value={form.patient_id}
              onChange={(e) => update('patient_id', e.target.value)} required>
              <option value="">-- Select patient --</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Doctor *</label>
            <select className="form-select" value={form.doctor_id}
              onChange={(e) => update('doctor_id', e.target.value)} required>
              <option value="">-- Select doctor --</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department_id ?? ''}
              onChange={(e) => update('department_id', e.target.value)}>
              <option value="">-- Select department --</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" value={form.appointment_date}
              onChange={(e) => update('appointment_date', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Time *</label>
            <input type="time" className="form-control" value={form.appointment_time}
              onChange={(e) => update('appointment_time', e.target.value)} required />
          </div>
          <div className={isEdit ? 'col-md-8' : 'col-12'}>
            <label className="form-label">Reason</label>
            <input type="text" className="form-control" value={form.reason || ''}
              onChange={(e) => update('reason', e.target.value)} />
          </div>
          {/* Status is only editable on edit, matching the original forms. */}
          {isEdit && (
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update appointment' : 'Save appointment'}
          </button>
          <Link to="/appointments" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
