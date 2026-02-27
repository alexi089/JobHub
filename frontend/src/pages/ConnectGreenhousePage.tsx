import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atsApi } from '../api/client';

export default function ConnectGreenhousePage() {
  const [apiKey, setApiKey] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: atsApi.connectGreenhouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atsAccounts'] });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to connect Greenhouse account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    connectMutation.mutate({ api_key: apiKey, company_name: companyName });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '60px auto' }}>
        <h1>Connect Greenhouse</h1>
        <p className="subtitle">Sync your job applications automatically</p>

        {error && <div className="error-box">{error}</div>}

        <div className="info-box">
          <strong>How to get your API key:</strong>
          <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Log in to your Greenhouse account</li>
            <li>Go to Configure → Dev Center → API Credential Management</li>
            <li>Create a new "Harvest API" credential</li>
            <li>Copy the API key and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">Greenhouse API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? 'Connecting...' : 'Connect Greenhouse'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
