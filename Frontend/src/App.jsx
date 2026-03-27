import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Users from './pages/Users';
import Tasks from './pages/Tasks';
import Budget from './pages/Budget';
import DashboardHome from './pages/DashboardHome';
import TaskReport from './pages/tasks/TaskReport';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder components for nested routes
// Routes logic below


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="tasks" element={<Tasks />} />
            
            {/* Admin & Emperor Only */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'emperor']} />}>
              <Route path="budget" element={<Budget />} />
            </Route>

            {/* Emperor Only */}
            <Route element={<ProtectedRoute allowedRoles={['emperor']} />}>
              <Route path="users" element={<Users />} />
            </Route>
            
            {/* Catch-all for inside dashboard */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Full Screen Report View (Outside DashboardLayout) */}
          <Route path="/dashboard/tasks/:taskId/report" element={<TaskReport />} />
        </Route>

        {/* Catch-all for global unknown URLs */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
