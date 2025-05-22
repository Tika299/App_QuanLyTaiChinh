import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './login';
import Home from './Home';
import PrivateRoute from './PrivateRoute';


function App() {
  return (
    <Router>
      {/* Toast container hiển thị ở mọi trang */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<LoginForm />} />
       
        {/* Các route cần đăng nhập */}
        <Route path="/Home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;
