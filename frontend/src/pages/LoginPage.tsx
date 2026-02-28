import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1000px', margin: '80px auto', alignItems: 'center' }}>
        {/* Left side - Welcome content */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Welcome to JobHub</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '16px' }}>Track all your job applications in one place</p>
          </div>

          <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>What you can do:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li style={{ marginBottom: '12px' }}>📊 View all your applications in one place</li>
              <li style={{ marginBottom: '12px' }}>🔄 Auto-sync from ATS platforms like Greenhouse</li>
              <li style={{ marginBottom: '12px' }}>📈 Track application status (applied, interviewing, offer, rejected)</li>
              <li>🎯 See which applications came from ATS vs manual entry</li>
            </ul>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="card" style={{ textAlign: 'center' }}>
          <img src={logo} alt="JobHub" style={{ height: '80px', width: 'auto', margin: '0 auto 16px' }} />
          <p className="subtitle" style={{ marginBottom: '24px' }}>Sign in to sync your applications</p>

          {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
