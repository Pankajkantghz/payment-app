import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Signin } from "../features/auth/pages/Signin";
import { Signup } from "../features/auth/pages/Signup";
import { Dashboard } from "../features/dashboard/pages/Dashboard";
import { SendMoney } from "../features/transfers/pages/SendMoney";

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
