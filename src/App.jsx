import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import NewSalePage from './pages/NewSalePage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage'; // <-- Import the new page
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/new-sale" element={<ProtectedRoute><NewSalePage /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      
      {/* 👇 ADD THIS FINAL ROUTE */}
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;