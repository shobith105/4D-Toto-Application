import { Routes, Route } from "react-router-dom";
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css'
import UploadTicket from "./pages/UploadTicket";

function App() {
 
  return (
    <Routes>
      {/*Login & Auth Routes*/}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<UploadTicket />} />

      {/* Add more routes here as needed */}
    </Routes>
  )
}

export default App
