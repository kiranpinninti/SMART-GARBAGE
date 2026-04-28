import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BinProvider } from './contexts/BinContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BinMonitoring from './pages/BinMonitoring';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BinProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bins" element={<BinMonitoring />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          </Routes>
        </BinProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
