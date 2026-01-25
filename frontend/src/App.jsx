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
      <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
      <Route path="/home" element={<><Navbar /><UploadTicket /></>} />
      <Route path="/verify" element={<><Navbar /><Verify /></>} />
      <Route path="/details" element={<><Navbar /><TicketList /></>} />
      <Route path="/tickets" element={<><Navbar /><TicketList /></>} />
      <Route path="/notifications" element={<><Navbar /><Notifications /></>} />

      {/* Add more routes here as needed */}
    </Routes>
  )
}


export default App
