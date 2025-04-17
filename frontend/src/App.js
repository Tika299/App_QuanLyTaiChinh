import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './login';
import SignupForm from './signup';
import Dashboard from './dashboard'; // Import thêm trang Dashboard
import ResetPassword from './resetpass';
import ForgotPasswordRequest from './password-request';
import Home from './Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path='/home'element = {<Home/>}/>
        <Route path="/password-request" element={<ForgotPasswordRequest />} />
        <Route path="/resetpass/:token" element={<ResetPassword />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
