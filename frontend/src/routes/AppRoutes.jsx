import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import NotFound from '../pages/NotFound.jsx';

import PatientList from '../pages/patients/PatientList.jsx';
import PatientForm from '../pages/patients/PatientForm.jsx';
import PatientView from '../pages/patients/PatientView.jsx';

import DoctorList from '../pages/doctors/DoctorList.jsx';
import DoctorForm from '../pages/doctors/DoctorForm.jsx';

import DepartmentList from '../pages/departments/DepartmentList.jsx';
import DepartmentForm from '../pages/departments/DepartmentForm.jsx';

import AppointmentList from '../pages/appointments/AppointmentList.jsx';
import AppointmentForm from '../pages/appointments/AppointmentForm.jsx';

import RecordList from '../pages/medical-records/RecordList.jsx';
import RecordForm from '../pages/medical-records/RecordForm.jsx';
import RecordView from '../pages/medical-records/RecordView.jsx';

import LabList from '../pages/laboratory/LabList.jsx';
import LabForm from '../pages/laboratory/LabForm.jsx';

import MedicineList from '../pages/pharmacy/MedicineList.jsx';
import MedicineForm from '../pages/pharmacy/MedicineForm.jsx';

import BillList from '../pages/billing/BillList.jsx';
import BillForm from '../pages/billing/BillForm.jsx';
import BillView from '../pages/billing/BillView.jsx';

/** Small helper so each protected page reads on one line below. */
function guarded(moduleKey, element) {
  return <ProtectedRoute moduleKey={moduleKey}>{element}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={guarded('dashboard', <Dashboard />)} />

        <Route path="/patients" element={guarded('patients', <PatientList />)} />
        <Route path="/patients/new" element={guarded('patients', <PatientForm />)} />
        <Route path="/patients/:id" element={guarded('patients', <PatientView />)} />
        <Route path="/patients/:id/edit" element={guarded('patients', <PatientForm />)} />

        <Route path="/doctors" element={guarded('doctors', <DoctorList />)} />
        <Route path="/doctors/new" element={guarded('doctors', <DoctorForm />)} />
        <Route path="/doctors/:id/edit" element={guarded('doctors', <DoctorForm />)} />

        <Route path="/departments" element={guarded('departments', <DepartmentList />)} />
        <Route path="/departments/new" element={guarded('departments', <DepartmentForm />)} />
        <Route path="/departments/:id/edit" element={guarded('departments', <DepartmentForm />)} />

        <Route path="/appointments" element={guarded('appointments', <AppointmentList />)} />
        <Route path="/appointments/new" element={guarded('appointments', <AppointmentForm />)} />
        <Route path="/appointments/:id/edit" element={guarded('appointments', <AppointmentForm />)} />

        <Route path="/medical-records" element={guarded('medical-records', <RecordList />)} />
        <Route path="/medical-records/new" element={guarded('medical-records', <RecordForm />)} />
        <Route path="/medical-records/:id" element={guarded('medical-records', <RecordView />)} />
        <Route path="/medical-records/:id/edit" element={guarded('medical-records', <RecordForm />)} />

        <Route path="/laboratory" element={guarded('laboratory', <LabList />)} />
        <Route path="/laboratory/new" element={guarded('laboratory', <LabForm />)} />
        <Route path="/laboratory/:id/edit" element={guarded('laboratory', <LabForm />)} />

        <Route path="/pharmacy" element={guarded('pharmacy', <MedicineList />)} />
        <Route path="/pharmacy/new" element={guarded('pharmacy', <MedicineForm />)} />
        <Route path="/pharmacy/:id/edit" element={guarded('pharmacy', <MedicineForm />)} />

        <Route path="/billing" element={guarded('billing', <BillList />)} />
        <Route path="/billing/new" element={guarded('billing', <BillForm />)} />
        <Route path="/billing/:id" element={guarded('billing', <BillView />)} />
        <Route path="/billing/:id/edit" element={guarded('billing', <BillForm />)} />
      </Route>

      {/* Entry point, matching the old index.php redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
