import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { toDateInput } from '../../utils/format.js';

const EMPTY = {
  medicine_name: '', category: '', quantity: '',
  unit_price: '', expiry_date: '', supplier: '',
};

export default function MedicineForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState(EMPTY);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/pharmacy/${id}`)
      .then(({ data }) => {
        const m = data.data;
        setCurrentStatus(m.status);
        setForm({
          medicine_name: m.medicine_name, category: m.category || '',
          quantity: m.quantity, unit_price: m.unit_price,
          expiry_date: toDateInput(m.expiry_date), supplier: m.supplier || '',
        });
      })
      .catch((err) => {
        flashError(getErrorMessage(err, 'Medicine not found.'));
        navigate('/pharmacy');
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
        await api.put(`/pharmacy/${id}`, form);
        flashSuccess('Medicine updated successfully.');
      } else {
        await api.post('/pharmacy', form);
        flashSuccess('Medicine added successfully.');
      }
      navigate('/pharmacy');
    } catch (err) {
      const data = err?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [getErrorMessage(err, 'Unable to save this medicine.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading medicine..." />;

  return (
    <Card title={isEdit ? `Edit medicine #${id}` : 'Add medicine'} icon={isEdit ? 'bi-pencil-square' : 'bi-capsule'}>
      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Medicine name *</label>
            <input type="text" className="form-control" value={form.medicine_name}
              onChange={(e) => update('medicine_name', e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <input type="text" className="form-control" value={form.category}
              onChange={(e) => update('category', e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">{isEdit ? 'Quantity (stock) *' : 'Quantity *'}</label>
            <input type="number" min="0" className="form-control" value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Unit price *</label>
            <input type="number" step="0.01" min="0" className="form-control" value={form.unit_price}
              onChange={(e) => update('unit_price', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Expiry date</label>
            <input type="date" className="form-control" value={form.expiry_date}
              onChange={(e) => update('expiry_date', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Supplier</label>
            <input type="text" className="form-control" value={form.supplier}
              onChange={(e) => update('supplier', e.target.value)} />
          </div>
          {isEdit && (
            <div className="col-md-6">
              <label className="form-label">Current status</label>
              <div className="form-control-plaintext"><StatusBadge status={currentStatus} /></div>
            </div>
          )}
        </div>

        <p className="text-muted small mt-3 mb-0">
          <i className="bi bi-info-circle me-1" />
          Status (Available / Low Stock / Out of Stock / Expired) is calculated
          automatically from quantity and expiry date.
        </p>

        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update medicine' : 'Save medicine'}
          </button>
          <Link to="/pharmacy" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
