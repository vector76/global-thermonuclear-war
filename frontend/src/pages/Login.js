import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/v1/login/google');
      const data = await response.json();
      // Redirect to Google's OAuth page
      window.location.href = data.authorization_url;
    } catch (err) {
      setError('Failed to initiate login: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>OAuth login options will appear here</p>
      <div className="placeholder-buttons">
        <button onClick={handleGoogleLogin}>Login with Google</button>
        <button disabled>Login with GitHub</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Login; 