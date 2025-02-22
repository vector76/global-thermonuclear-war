import React from 'react';

function Admin() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <div className="admin-section">
        <h2>System Limits</h2>
        <ul>
          <li>Maximum concurrent missiles: 1000</li>
          <li>Default daily launch limit: 10</li>
          <li>Default concurrent missile limit: 3</li>
        </ul>
      </div>
    </div>
  );
}

export default Admin; 