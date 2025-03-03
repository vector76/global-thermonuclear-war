import React from 'react';

function ApiDocs(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-950">
      <style>{`
        .App .api-docs-content { text-align: left; }
        .App .api-docs-title { text-align: center; }
      `}</style>
      <div className="px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-12 api-docs-title">API Documentation</h1>
        
        <div className="api-docs-content">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Authentication</h2>
            <div className="prose prose-invert">
              <p className="text-gray-300">All API endpoints require authentication using an API key in the Authorization header:</p>
              <pre className="bg-gray-800 p-4 rounded-md font-mono text-sm text-gray-300 mt-4">
Authorization: Bearer your_api_key_here</pre>
              <p className="text-gray-300 mt-4">Contact us to obtain an API key for your application.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Endpoints</h2>
            
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Launch Missile</h3>
                <div className="bg-gray-800 rounded-md p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium">POST</span>
                    <code className="text-gray-300 font-mono">/api/v1/missiles/launch</code>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Query Parameters</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><code>target_latitude</code>: float (-90 to 90)</li>
                      <li><code>target_longitude</code>: float (-180 to 180)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Rate Limits</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Maximum concurrent missiles per user</li>
                      <li>• Maximum launches per day per user</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Check Launch Availability</h3>
                <div className="bg-gray-800 rounded-md p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">GET</span>
                    <code className="text-gray-300 font-mono">/api/v1/missiles/can-launch</code>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Returns</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Boolean indicating if launch is possible</li>
                      <li>• Reason if launch is not possible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ApiDocs; 