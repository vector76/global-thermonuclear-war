import React from 'react';

function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>OAuth login options will appear here</p>
      <div className="placeholder-buttons">
        <button disabled>Login with Google</button>
        <button disabled>Login with GitHub</button>
      </div>
    </div>
  );
}

export default Login; 