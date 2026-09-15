import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import { toDateInput } from '../../utils/format.js';

const STATUSES = ['Requested', 'Sample Collected', 'Processing', 'Completed'];
const today = () => new Date().toISOString().split('T')[0];

/**
 * Create mode: pick patient + doctor and raise a request (always starts
 * as "Requested"). Edit mode: patient and doctor are fixed, and the lab
 * staff update the test details, status and result - exactly how
 * laboratory/add.php and laboratory/edit.php behaved.
 */
export default function LabForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', test_name: '',
    test_date: today(), result: '', status: 'Requested', notes: '',
  });
  const [test, setTest] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (isEdit) {
          const { data } = await api.get(`/laboratory/${id}`);
          const t = data.data;
          setTest(t);
          setForm({
            patient_id: t.patient_id, doctor_id: t.doctor_id ?? '',
            test_name: t.test_name, test_date: toDateInput(t.test_date),
            result: t.result || '', status: t.status, notes: t.notes || '',
          });
        } else {
          const [pRes, dRes] = await Promise.all([
            api.get('/lookups/patients'),
            api.get('/lookups/doctors'),
          ]);
          setPatients(pRes.data.data);
          setDoctors(dRes.data.data);
        }
      } catch (err) {
        flashError(getErrorMessage(err, 'Unable to load this test request.'));
        navigate('/laboratory');
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
        await api.put(`/laboratory/${id}`, form);
        flashSuccess('Test request updated successfully.');
      } else {
        await api.post('/laboratory', form);
        flashSuccess('Laboratory test request created.');
      }
      navigate('/laboratory');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this test request.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  return (
    <Card
      title={isEdit ? `Update test request #${id}` : 'New test request'}
      icon={isEdit ? 'bi-pencil-square' : 'bi-clipboard2-plus'}
    >
      <FormErrors errors={errors} />

      {isEdit && test && (
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="detail-label">Patient</div>
            <div className="detail-value">{test.patient_name}</div>
          </div>
          <div className="col-md-6">
            <div className="detail-label">Requesting doctor</div>
            <div className="detail-value">{test.doctor_name || '-'}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {!isEdit && (
            <>
              <div className="col-md-6">
                <label className="form-label">Patient *</label>
                <select className="form-select" value={form.patient_id}
                  onChange={(e) => update('patient_id', e.target.value)} required>
                  <option value="">-- Select patient --</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Requesting doctor</label>
                <select className="form-select" value={form.doctor_id}
                  onChange={(e) => update('doctor_id', e.target.value)}>
                  <option value="">-- Select doctor --</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="col-md-6">
            <label className="form-label">Test name *</label>
            <input type="text" className="form-control" value={form.test_name}
              onChange={(e) => update('test_name', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Test date *</label>
            <input type="date" className="form-control" value={form.test_date}
              onChange={(e) => update('test_date', e.target.value)} required />
          </div>

          {isEdit && (
            <>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Result</label>
                <textarea className="form-control" rows="3" placeholder="Enter test result once available..."
                  value={form.result} onChange={(e) => update('result', e.target.value)} />
              </div>
            </>
          )}

          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows="2" value={form.notes}
              onChange={(e) => update('notes', e.target.value)} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create request'}
          </button>
          <Link to="/laboratory" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
