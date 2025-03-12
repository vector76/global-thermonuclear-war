import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  authorization_url?: string;
}

interface LoginProps {
  isAuthenticated: boolean;
}

function Login({ isAuthenticated }: LoginProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const response = await fetch('/api/v1/auth/login/google');
      const data: LoginResponse = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (err) {
      setError('Failed to initiate login: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div className="placeholder-buttons">
        <button onClick={handleGoogleLogin}>Login with Google</button>
        <button disabled>Login with GitHub (coming soon)</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Login; 