import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Production from './pages/Production';
import Salary from './pages/Salary';
import Materials from './pages/Materials';
import Maintenance from './pages/Maintenance';
import Home from './pages/Home';

import AICopilot from './components/AICopilot/AICopilot';

// Protected Route Component (Placeholder)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="production" element={<Production />} />
            <Route path="salary" element={<Salary />} />
            <Route path="materials" element={<Materials />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global UI Components */}
        <AICopilot />
      </Router>
    </Provider>
  );
}

export default App;
