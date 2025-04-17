import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home';
import Transaction from './Transaction';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transaction />} />
      </Routes>
    </Router>
  );
}

export default App;
