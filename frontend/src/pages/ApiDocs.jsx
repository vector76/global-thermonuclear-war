import React from 'react';

function ApiDocs() {
  return (
    <div>
      <h1>API Documentation</h1>
      <div className="api-section">
        <h2>Endpoints</h2>
        <pre>
          POST /api/v1/launch
          GET /api/v1/missiles
          GET /api/v1/impacts
        </pre>
      </div>
    </div>
  );
}

export default ApiDocs; 