import React from 'react';
import { Link } from 'react-router-dom';

function ApiDocs(): React.ReactElement {
  const serverUrl = `${window.location.protocol}//${window.location.host}`;

  return (
    <div className="legal-content">
      <h1>API Documentation</h1>
      <section>
        <h2>Authentication</h2>
        <p>All API endpoints require authentication using an API key in the Authorization header:</p>
        <pre>Authorization: Bearer YOUR_API_KEY_HERE</pre>
        <p>API keys can be created in the <Link to="/account">Account</Link> page.</p>
      </section>

      <section>
        <h2>Launch Missile</h2>
        <div>
          <div>
            <span>POST</span>
            <code>/api/v1/missiles/launch</code>
          </div>
          
          <div>
            <h4>Example Request</h4>
            <pre>{`curl -X POST "${serverUrl}/api/v1/missiles/launch?target_latitude=40.7128&target_longitude=-74.0060" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`}</pre>
          </div>
          
          <div>
            <h4>Query Parameters</h4>
            <ul>
              <li><code>target_latitude</code>: float (-90 to 90)</li>
              <li><code>target_longitude</code>: float (-180 to 180)</li>
            </ul>
          </div>
          
          <div>
            <h4>Rate Limits</h4>
            <p>This endpoint is subject to rate limits:</p>
            <ul>
              <li>Maximum simultaneous missiles in flight per user</li>
              <li>Maximum launches per day per user</li>
            </ul>
          </div>
        </div>
        </section>

        <section>
          <h2>Check Launch Availability</h2>
          <div>
            <div>
            <span>GET</span>
            <code>/api/v1/missiles/can-launch</code>
          </div>
          
          <div>
            <h4>Example Request</h4>
            <pre>{`curl "${serverUrl}/api/v1/missiles/can-launch" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`}</pre>
          </div>
          
          <div>
            <h4>Returns</h4>
            <ul>
              <li>Boolean indicating if launch is possible</li>
              <li>Reason, if launch is not possible</li>
            </ul>
          </div>
        </div>
      </section>
      <section>
        <h2>Testing</h2>
        <div>
          <div>
            The API is also available at <a href={`${serverUrl}/api/v1/docs`}>{serverUrl}/api/v1/docs</a>.
          </div>
        </div>
      </section>
    </div>
  );
}

export default ApiDocs; 