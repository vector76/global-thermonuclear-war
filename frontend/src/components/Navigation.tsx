import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  isAdmin: boolean;
}

function Navigation({ isAuthenticated, userEmail, isAdmin }: NavigationProps): React.ReactElement {
  const handleLogout = async (): Promise<void> => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.href = '/';  // Redirect to home page instead of reloading
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="main-nav">
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <>
            <li><span className="user-email">{userEmail}</span></li>
            <li><Link to="/account">Account</Link></li>
            <li><Link to="/api-docs">API Docs</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation; 