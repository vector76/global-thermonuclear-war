import React from 'react';
import { Link } from 'react-router-dom';

function Navigation({ isAuthenticated, userEmail }) {
  return (
    <nav className="main-nav">
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <>
            <li><span className="user-email">{userEmail}</span></li>
            <li><Link to="/api-docs">API Docs</Link></li>
            <li><a href="/api/v1/auth/logout">Logout</a></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
        <li><Link to="/admin">Admin</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation; 