import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="main-nav">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/api-docs">API Docs</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation; 