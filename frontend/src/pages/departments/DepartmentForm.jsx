import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import FormErrors from '../../components/FormErrors.jsx';

export default function DepartmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { flashSuccess, flashError } = useFlash();

  const [form, setForm] = useState({ department_name: '', description: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/departments/${id}`)
      .then(({ data }) => setForm({
        department_name: data.data.department_name,
        description: data.data.description || '',
      }))
      .catch((err) => {
        flashError(getErrorMessage(err, 'Department not found.'));
        navigate('/departments');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, flashError]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/departments/${id}`, form);
        flashSuccess('Department updated successfully.');
      } else {
        await api.post('/departments', form);
        flashSuccess('Department added successfully.');
      }
      navigate('/departments');
    } catch (err) {
      setErrors([getErrorMessage(err, 'Unable to save this department.')]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading department..." />;

  return (
    <Card title={isEdit ? `Edit department #${id}` : 'Add department'} icon={isEdit ? 'bi-pencil-square' : 'bi-diagram-3'}>
      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Department name *</label>
          <input type="text" className="form-control" value={form.department_name}
            onChange={(e) => setForm({ ...form, department_name: e.target.value })} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn app-btn-primary" disabled={saving}>
            <i className="bi bi-check-lg" /> {saving ? 'Saving...' : isEdit ? 'Update department' : 'Save department'}
          </button>
          <Link to="/departments" className="btn app-btn-outline">Cancel</Link>
        </div>
      </form>
    </Card>
  );
}
