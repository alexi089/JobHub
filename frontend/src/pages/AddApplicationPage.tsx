import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/client';
import logo from '../assets/logo.png';

export default function AddApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    status: 'applied',
    applied_at: new Date().toISOString().split('T')[0], // Today's date
    job_url: '',
    notes: '',
  });

  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to add application');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Convert date to ISO string for backend
    const dataToSubmit = {
      ...formData,
      applied_at: new Date(formData.applied_at).toISOString(),
      job_url: formData.job_url || undefined,
      notes: formData.notes || undefined,
    };

    createMutation.mutate(dataToSubmit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Back to Dashboard
          </Link>
          <img src={logo} alt="JobHub" style={{ height: '120px', width: 'auto' }} />
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Add Application</h1>
        <p className="subtitle" style={{ marginBottom: '24px' }}>Manually track a job application</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="company_name">Company Name *</label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g., Google"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="job_title">Job Title *</label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="applied_at">Application Date *</label>
            <input
              id="applied_at"
              name="applied_at"
              type="date"
              value={formData.applied_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="job_url">Job Posting URL</label>
            <input
              id="job_url"
              name="job_url"
              type="url"
              value={formData.job_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any notes about this application..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
              style={{ flex: 1 }}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Application'}
            </button>
            <Link to="/dashboard" style={{ flex: 1 }}>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
