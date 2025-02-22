import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';
import './App.css';
import './styles/Navigation.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/api-docs" element={<ApiDocs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
