import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import MapTest from './components/MapTest';
import { MissileProvider } from './contexts/MissileContext';
import './App.css';
import './styles/Navigation.css';
import './styles/Legal.css';
import ProtectedRoute from './components/ProtectedRoute';

interface AuthResponse {
  email: string;
  is_admin: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status on load
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const data: AuthResponse = await response.json();
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
      <MissileProvider>
        <div className="App">
          <Navigation 
            isAuthenticated={isAuthenticated} 
            userEmail={userEmail}
            isAdmin={isAdmin}
          />
          <main>
            <Routes>
              <Route path="/" element={<Home isAuthenticated={isAuthenticated} isAdmin={isAdmin} />} />
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
              <Route path="/map-test" element={<MapTest />} />
            </Routes>
          </main>
          <footer>
            <nav>
              <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
            </nav>
          </footer>
        </div>
      </MissileProvider>
    </Router>
  );
}

export default App; 