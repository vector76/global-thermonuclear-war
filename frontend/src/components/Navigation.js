import React from 'react';
import { Link } from 'react-router-dom';

function Navigation({ isAuthenticated, userEmail, isAdmin }) {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.reload();  // Refresh to clear state
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