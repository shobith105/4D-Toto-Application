import { Routes, Route } from "react-router-dom";
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css'
import UploadTicket from "./pages/UploadTicket";
import TicketDetails from "./components/TicketDetails";
import TicketList from "./pages/TicketList";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import Notifications from "./pages/Notifications";
import Navbar from "./components/Navbar";
import PredictionPage from "./pages/PredictionPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
 
  return (
    <Routes>
      {/*Login & Auth Routes - No Navbar */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* App routes - With Navbar */}
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Navbar /><UploadTicket /></ProtectedRoute>} />
      <Route path="/verify" element={<ProtectedRoute><Navbar /><Verify /></ProtectedRoute>} />
      <Route path="/details" element={<ProtectedRoute><Navbar /><TicketList /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Navbar /><TicketList /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Navbar /><Notifications /></ProtectedRoute>} />
      <Route path="/predictions" element={<ProtectedRoute><Navbar /><PredictionPage /></ProtectedRoute>} />

      {/* Add more routes here as needed */}
    </Routes>
  )
}


export default App
