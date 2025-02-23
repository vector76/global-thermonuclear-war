import React from 'react';

function Terms() {
  return (
    <div className="legal-content">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toISOString().split('T')[0]}</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Global Thermonuclear War simulation game, you agree to these terms.</p>
      </section>

      <section>
        <h2>2. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Interfere with other users' experience</li>
          <li>Attempt to access admin functions without authorization</li>
        </ul>
      </section>

      <section>
        <h2>3. API Usage</h2>
        <ul>
          <li>API access may be rate limited</li>
          <li>Abuse may result in API key revocation</li>
        </ul>
      </section>

      <section>
        <h2>4. Termination</h2>
        <p>We reserve the right to:</p>
        <ul>
          <li>Modify launch limits as needed</li>
        </ul>
      </section>

      <section>
        <h2>5. Disclaimer</h2>
        <p>This is a simulation game. No actual missiles are launched.</p>
        <p>Service provided "as is" without warranties.</p>
      </section>
    </div>
  );
}

export default Terms; 