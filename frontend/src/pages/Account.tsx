import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ApiKey {
  id: number;
  name: string;
  truncated_key: string;
  created_at: string;
  last_used_at: string | null;
  is_revoked: boolean;
}

interface UserProfile {
  email: string;
  oauth_provider: string;
}

export default function Account() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApiKeys();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      setError('Failed to load user profile');
      console.error(err);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/internal/api-keys', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError('Failed to load API keys');
      console.error(err);
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/internal/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setNewKey(data.key);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      setError('Failed to create API key');
      console.error(err);
    }
  };

  const revokeApiKey = async (id: number) => {
    try {
      const response = await fetch(`/api/internal/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      fetchApiKeys();
    } catch (err) {
      setError('Failed to revoke API key');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Account Settings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {userProfile && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">Profile Information</h2>
            <div className="flex flex-col items-center text-white">
              <div>Email: {userProfile.email}</div>
              <div>Login Provider: {userProfile.oauth_provider}</div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-white text-center">API Keys</h2>
          
          <form onSubmit={createApiKey} className="mb-8">
            <div className="flex gap-4 justify-center">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter API key name"
                className="w-96 bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Create API Key
              </button>
            </div>
          </form>

          {newKey && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-6 max-w-3xl mx-auto">
              <p className="font-bold">New API Key Created!</p>
              <p className="font-mono break-all mt-2">{newKey}</p>
              <p className="text-sm mt-2 text-green-200">Make sure to copy this key now. You won't be able to see it again!</p>
            </div>
          )}

          <style>{`
            .api-key-table { width: 1000px; }
            .api-key-table td.key-cell { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
            .table-container { display: flex; justify-content: center; min-width: 100%; }
            .table-scroll-container { max-width: 100%; overflow-x: auto; display: flex; justify-content: center; }
            .api-key-table td, .api-key-table th {
              border: 1px solid rgba(75, 85, 99, 0.3);
              background-color: rgba(31, 41, 55, 0.3);
            }
            .api-key-table tr:hover td {
              background-color: rgba(31, 41, 55, 0.5);
            }
          `}</style>

          <div className="table-container">
            <div className="table-scroll-container">
              <table className="api-key-table border-separate border-spacing-y-2 border-spacing-x-1">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left px-4 py-2 w-48 rounded-l">Name</th>
                    <th className="text-left px-4 py-2 w-32">Key</th>
                    <th className="text-left px-4 py-2">Created</th>
                    <th className="text-left px-4 py-2">Last Used</th>
                    <th className="text-left px-4 py-2 w-24 rounded-r">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {apiKeys.map((apiKey) => (
                    <tr 
                      key={apiKey.id}
                    >
                      <td className="px-4 py-3 rounded-l">{apiKey.name}</td>
                      <td className="px-4 py-3 key-cell">{apiKey.truncated_key}</td>
                      <td className="px-4 py-3">{new Date(apiKey.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleString() : 'Never'}</td>
                      <td className="px-4 py-3 rounded-r">
                        <button
                          onClick={() => revokeApiKey(apiKey.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 