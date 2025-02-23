import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import './App.css';
import './styles/Navigation.css';
import './styles/Legal.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication status on load
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserEmail(data.email);
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Navigation 
          isAuthenticated={isAuthenticated} 
          userEmail={userEmail}
          isAdmin={isAdmin}
        />
        <main>
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<Login isAuthenticated={isAuthenticated} />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <footer>
          <nav>
            <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
          </nav>
        </footer>
      </div>
    </Router>
  );
}

export default App;
