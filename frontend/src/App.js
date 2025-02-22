import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [healthStatus, setHealthStatus] = useState('Unknown');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [configResult, setConfigResult] = useState(null);
  const [error, setError] = useState(null);
  const [newConfigValue, setNewConfigValue] = useState('');

  // Check health status on load
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus(data.status);
      setError(null);
    } catch (err) {
      setHealthStatus('Error');
      setError('Failed to check health: ' + err.message);
    }
  };

  const getConfig = async () => {
    try {
      const response = await fetch(`/api/config/${configKey}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConfigResult(data);
      setError(null);
    } catch (err) {
      setConfigResult(null);
      setError('Failed to get config: ' + err.message);
    }
  };

  const setConfig = async () => {
    try {
      const response = await fetch(`/api/config?key=${configKey}&value=${newConfigValue}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConfigResult(data);
      setError(null);
    } catch (err) {
      setConfigResult(null);
      setError('Failed to set config: ' + err.message);
    }
  };

  return (
    <div className="App">
      <h1>Backend Test Interface</h1>
      
      {/* Health Check Section */}
      <section className="test-section">
        <h2>Health Check</h2>
        <div>
          Status: <span className={`status-${healthStatus.toLowerCase()}`}>{healthStatus}</span>
          <button onClick={checkHealth}>Check Health</button>
        </div>
      </section>

      {/* Config Test Section */}
      <section className="test-section">
        <h2>Configuration Test</h2>
        <div>
          <input
            type="text"
            value={configKey}
            onChange={(e) => setConfigKey(e.target.value)}
            placeholder="Config Key"
          />
          <input
            type="text"
            value={newConfigValue}
            onChange={(e) => setNewConfigValue(e.target.value)}
            placeholder="Config Value"
          />
          <button onClick={setConfig}>Set Config</button>
          <button onClick={getConfig}>Get Config</button>
        </div>
        {configResult && (
          <div className="result">
            <pre>{JSON.stringify(configResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* Error Display */}
      {error && (
        <section className="error-section">
          <div className="error">{error}</div>
        </section>
      )}
    </div>
  );
}

export default App;
