import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Goals from './components/Goals';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/" element={<Goals />} />
      </Routes>
    </Router>
  );
};

export default App;