import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import { toDateInput } from '../../utils/format.js';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = {
  patient_id: '', doctor_id: '', record_date: '',
  diagnosis: '', treatment: '', prescription: '', notes: '',
};

export default function RecordForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState({ ...EMPTY, record_date: today() });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [pRes, dRes] = await Promise.all([
          api.get('/lookups/patients'),
          api.get('/lookups/doctors'),
        ]);
        setPatients(pRes.data.data);
        setDoctors(dRes.data.data);

        if (isEdit) {
          const { data } = await api.get(`/medical-records/${id}`);
          const r = data.data;
          setForm({
            patient_id: r.patient_id, doctor_id: r.doctor_id,
            record_date: toDateInput(r.record_date),
            diagnosis: r.diagnosis, treatment: r.treatment || '',
            prescription: r.prescription || '', notes: r.notes || '',
          });
        }
      } catch (err) {
        flashError(getErrorMessage(err, 'Unable to load this record.'));
        navigate('/medical-records');
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
        await api.put(`/medical-records/${id}`, form);
        flashSuccess('Medical record updated successfully.');
      } else {
        await api.post('/medical-records', form);
        flashSuccess('Medical record added successfully.');
      }
      navigate('/medical-records');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this record.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  return (
    <Card title={isEdit ? `Edit medical record #${id}` : 'Add medical record'} icon={isEdit ? 'bi-pencil-square' : 'bi-file-earmark-plus'}>
      <FormErrors errors={errors} />

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
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" value={form.record_date}
              onChange={(e) => update('record_date', e.target.value)} required />
          </div>
          <div className="col-md-8">
            <label className="form-label">Diagnosis *</label>
            <input type="text" className="form-control" value={form.diagnosis}
              onChange={(e) => update('diagnosis', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Treatment</label>
            <input type="text" className="form-control" value={form.treatment}
              onChange={(e) => update('treatment', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Prescription</label>
            <input type="text" className="form-control" value={form.prescription}
              onChange={(e) => update('prescription', e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows="3" value={form.notes}
              onChange={(e) => update('notes', e.target.value)} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update record' : 'Save record'}
          </button>
          <Link to="/medical-records" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
