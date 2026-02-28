import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, interviewsApi } from '../api/client';
import logo from '../assets/logo.png';
import type { Interview } from '../types';

export default function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    status: 'applied',
    job_url: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewFormData, setInterviewFormData] = useState({
    interview_date: '',
    interview_time: '',
    interview_type: '',
    location: '',
    notes: '',
  });

  // Fetch application data
  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.get(id!),
    enabled: !!id,
  });

  // Fetch interviews for this application
  const { data: allInterviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewsApi.list(),
  });

  const interviews = allInterviews?.filter(i => i.application_id === id) || [];

  // Populate form when data loads
  useEffect(() => {
    if (application) {
      setFormData({
        job_title: application.job_title,
        company_name: application.company_name,
        status: application.status,
        job_url: application.job_url || '',
        notes: application.notes || '',
      });
    }
  }, [application]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => applicationsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to update application');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => applicationsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to delete application');
    },
  });

  const createInterviewMutation = useMutation({
    mutationFn: interviewsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowInterviewForm(false);
      setInterviewFormData({
        interview_date: '',
        interview_time: '',
        interview_type: '',
        location: '',
        notes: '',
      });
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to schedule interview');
    },
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: interviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to delete interview');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = `${interviewFormData.interview_date}T${interviewFormData.interview_time}:00`;
    createInterviewMutation.mutate({
      application_id: id!,
      interview_date: new Date(dateTime).toISOString(),
      interview_type: interviewFormData.interview_type || undefined,
      location: interviewFormData.location || undefined,
      notes: interviewFormData.notes || undefined,
    });
  };

  const handleDeleteInterview = (interviewId: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      deleteInterviewMutation.mutate(interviewId);
    }
  };

  const handleInterviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInterviewFormData({
      ...interviewFormData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <div className="loading">Loading application...</div>;
  }

  if (!application) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
          <h2>Application not found</h2>
          <Link to="/dashboard">
            <button className="btn btn-primary">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Back to Dashboard
          </Link>
          <img src={logo} alt="JobHub" style={{ height: '120px', width: 'auto' }} />
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Edit Application</h1>
        <p className="subtitle" style={{ marginBottom: '24px' }}>Update your application details</p>

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
            <label htmlFor="status">Status *</label>
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

          {application.applied_at && (
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '14px', color: '#6b7280' }}>
              <strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
              style={{ flex: 1 }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/dashboard" style={{ flex: 1 }}>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
                Cancel
              </button>
            </Link>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="btn"
              style={{
                width: '100%',
                background: '#fee',
                color: '#ef4444',
                border: '1px solid #fecaca'
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Application'}
            </button>
          </div>
        </form>

        {/* Interviews Section - Outside the main form */}
        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Interviews</h3>
            <button
              type="button"
              onClick={() => setShowInterviewForm(!showInterviewForm)}
              className="btn btn-secondary btn-small"
            >
              {showInterviewForm ? 'Cancel' : '+ Schedule Interview'}
            </button>
          </div>

          {showInterviewForm && (
            <form onSubmit={handleScheduleInterview} style={{ background: 'var(--background)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="interview_date">Date *</label>
                  <input
                    id="interview_date"
                    name="interview_date"
                    type="date"
                    value={interviewFormData.interview_date}
                    onChange={handleInterviewFormChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="interview_time">Time *</label>
                  <input
                    id="interview_time"
                    name="interview_time"
                    type="time"
                    value={interviewFormData.interview_time}
                    onChange={handleInterviewFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="interview_type">Type</label>
                <select
                  id="interview_type"
                  name="interview_type"
                  value={interviewFormData.interview_type}
                  onChange={handleInterviewFormChange}
                >
                  <option value="">Select type</option>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Video Interview">Video Interview</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Final Round">Final Round</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location / Link</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={interviewFormData.location}
                  onChange={handleInterviewFormChange}
                  placeholder="Zoom link, address, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={interviewFormData.notes}
                  onChange={handleInterviewFormChange}
                  placeholder="Interviewer names, topics to prepare, etc."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createInterviewMutation.isPending}
              >
                {createInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </form>
          )}

          {/* List of scheduled interviews */}
          {interviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>
                        {new Date(interview.interview_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span style={{ color: 'var(--text-light)' }}>
                        {new Date(interview.interview_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                      {interview.interview_type && (
                        <span className="badge">{interview.interview_type}</span>
                      )}
                    </div>
                    {interview.location && (
                      <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
                        📍 {interview.location}
                      </div>
                    )}
                    {interview.notes && (
                      <div style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        {interview.notes}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteInterview(interview.id)}
                    className="btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#fee',
                      color: '#ef4444',
                      border: '1px solid #fecaca'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : !showInterviewForm && (
            <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              No interviews scheduled yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
