import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import { toDateInput } from '../../utils/format.js';

const today = () => new Date().toISOString().split('T')[0];

export default function BillForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState({
    patient_id: '', service: '', description: '',
    amount: '', bill_date: today(), payment_status: 'Pending',
  });
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const pRes = await api.get('/lookups/patients');
        setPatients(pRes.data.data);

        if (isEdit) {
          const { data } = await api.get(`/billing/${id}`);
          const b = data.data;
          setForm({
            patient_id: b.patient_id, service: b.service,
            description: b.description || '', amount: b.amount,
            bill_date: toDateInput(b.bill_date), payment_status: b.payment_status,
          });
        }
      } catch (err) {
        flashError(getErrorMessage(err, 'Unable to load this bill.'));
        navigate('/billing');
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
        await api.put(`/billing/${id}`, form);
        flashSuccess('Bill updated successfully.');
      } else {
        await api.post('/billing', form);
        flashSuccess('Bill created successfully.');
      }
      navigate('/billing');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this bill.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  return (
    <Card title={isEdit ? `Edit bill #${id}` : 'Create bill'} icon={isEdit ? 'bi-pencil-square' : 'bi-receipt-cutoff'}>
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
            <label className="form-label">Service *</label>
            <input type="text" className="form-control" placeholder="e.g. Consultation, Lab Test"
              value={form.service} onChange={(e) => update('service', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Amount (Rs.) *</label>
            <input type="number" step="0.01" min="0" className="form-control" value={form.amount}
              onChange={(e) => update('amount', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Bill date *</label>
            <input type="date" className="form-control" value={form.bill_date}
              onChange={(e) => update('bill_date', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Payment status</label>
            <select className="form-select" value={form.payment_status}
              onChange={(e) => update('payment_status', e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description}
              onChange={(e) => update('description', e.target.value)} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update bill' : 'Save bill'}
          </button>
          <Link to="/billing" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
