import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/v1/auth/login/google');
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError('Failed to get authorization URL');
      }
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