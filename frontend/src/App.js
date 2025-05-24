import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './login'; 
import SignupForm from './signup'; 
import Dashboard from './dashboard'; 
import ResetPassword from './reset-password'; 
import ForgotPasswordRequest from './password-request'; 
import Home from './Home';
import Transaction from './Transaction';
import UserList from './userlist';
import Goals from './Goals';
import Profile from './Profile';
import EditProfile from './EditProfile';
import PrivateRoute from './PrivateRoute';
import Logout from './Logout';

function App() {
  return (
    <Router>
      {/* Toast container hiển thị ở mọi trang */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/password-request" element={<ForgotPasswordRequest />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Các route cần đăng nhập */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute>
            <Transaction />
          </PrivateRoute>
        } />
        <Route path="/logout" element={
          <PrivateRoute>
            <Logout />
          </PrivateRoute>
        } />
        <Route path="/userlist" element={
          <PrivateRoute>
            <UserList />
          </PrivateRoute>
        } />
        <Route path="/goals" element={
          <PrivateRoute>
            <Goals />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/EditProfile" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;