import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Account from './pages/Account';
import MapTest from './components/MapTest';
import { MissileProvider } from './contexts/MissileContext';
import { CoordinateProvider } from './contexts/CoordinateContext';
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
        <CoordinateProvider>
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
                    <ProtectedRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/api-docs" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <ApiDocs />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/map-test" element={<MapTest />} />
                {/* Catch-all route for 404s */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer>
              <nav>
                <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link>
              </nav>
            </footer>
          </div>
        </CoordinateProvider>
      </MissileProvider>
    </Router>
  );
}

export default App; 