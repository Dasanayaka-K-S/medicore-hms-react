import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { useFlash } from '../../context/FlashContext.jsx';
import Card from '../../components/Card.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function DepartmentList() {
  const { flashSuccess, flashError } = useFlash();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to load departments.'));
    } finally {
      setLoading(false);
    }
  }, [flashError]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(dept) {
    if (!window.confirm(`Are you sure you want to delete "${dept.department_name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/departments/${dept.id}`);
      flashSuccess('Department deleted successfully.');
      load();
    } catch (err) {
      flashError(getErrorMessage(err, 'Unable to delete this department.'));
    }
  }

  return (
    <Card
      title="Departments"
      icon="bi-diagram-3"
      bodyClassName="p-0"
      actions={
        <Link to="/departments/new" className="btn app-btn-primary btn-sm">
          <i className="bi bi-plus-lg" /> Add department
        </Link>
      }
    >
      {loading ? (
        <Loader label="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState icon="bi-diagram-3" message="No departments found." />
      ) : (
        <div className="table-responsive">
          <table className="table app-table mb-0">
            <thead>
              <tr><th>ID</th><th>Department Name</th><th>Description</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>#{d.id}</td>
                  <td>{d.department_name}</td>
                  <td>{d.description || '-'}</td>
                  <td className="text-end">
                    <Link to={`/departments/${d.id}/edit`} className="btn btn-sm app-btn-outline" title="Edit">
                      <i className="bi bi-pencil" />
                    </Link>{' '}
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(d)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
