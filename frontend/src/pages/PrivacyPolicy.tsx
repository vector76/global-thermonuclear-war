import React from 'react';

function PrivacyPolicy(): React.ReactElement {
  return (
    <div className="legal-content">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toISOString().split('T')[0]}</p>

      <section>
        <h2>1. Information We Collect</h2>
        <ul>
          <li>Email address (from OAuth provider)</li>
          <li>OAuth provider ID</li>
          <li>Game activity data</li>
          <li>Session data for authentication</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the game service</li>
          <li>To identify and prevent abuse</li>
          <li>To display global game activity to all users</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Sharing</h2>
        <p>All missile launches and impacts are visible to other users.</p>
        <p>We do not share your email or OAuth information with other users.</p>
      </section>
    </div>
  );
}

export default PrivacyPolicy; 