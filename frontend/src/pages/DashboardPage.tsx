import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationsApi, atsApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { ATSAccount } from '../types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.list,
  });

  const { data: atsAccounts, isLoading: atsLoading } = useQuery({
    queryKey: ['atsAccounts'],
    queryFn: atsApi.listAccounts,
  });

  const syncMutation = useMutation({
    mutationFn: atsApi.syncGreenhouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['atsAccounts'] });
    },
  });

  const handleSync = (accountId: string) => {
    syncMutation.mutate(accountId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return '#5469d4';
      case 'interviewing': return '#f59e0b';
      case 'offer': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Applications Dashboard</h1>
          <p className="subtitle">Welcome back, {user?.name || user?.email}</p>
        </div>
        <div className="header-actions">
          <Link to="/ats/connect">
            <button className="btn btn-primary">+ Connect ATS</button>
          </Link>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      {/* ATS Accounts Section */}
      {!atsLoading && atsAccounts && atsAccounts.length > 0 && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>Connected Accounts</h2>
          <div className="ats-grid">
            {(atsAccounts as ATSAccount[]).map((account) => (
              <div key={account.id} className="ats-card">
                <div className="ats-icon">🏢</div>
                <div className="ats-info">
                  <h3>{account.company_name}</h3>
                  <p className="ats-platform">{account.platform}</p>
                  {account.last_synced ? (
                    <p className="ats-sync">
                      Last synced: {new Date(account.last_synced).toLocaleString()}
                    </p>
                  ) : (
                    <p className="ats-sync">Not synced yet</p>
                  )}
                </div>
                <button
                  onClick={() => handleSync(account.id)}
                  disabled={syncMutation.isPending}
                  className="btn btn-small"
                >
                  {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No ATS Connected */}
      {!atsLoading && (!atsAccounts || atsAccounts.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h2>Connect Your ATS</h2>
          <p>Sync applications from Greenhouse, Workday, and more</p>
          <Link to="/ats/connect">
            <button className="btn btn-primary">Connect Greenhouse</button>
          </Link>
        </div>
      )}

      {/* Applications Table */}
      {applications && applications.length > 0 && (
        <div className="card">
          <h2>Applications ({applications.length})</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="bold">{app.company_name}</td>
                    <td>{app.job_title}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: `${getStatusColor(app.status)}15`, color: getStatusColor(app.status) }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>
                      {app.ats_account_id ? (
                        <span className="badge">Greenhouse</span>
                      ) : (
                        <span className="badge badge-secondary">Manual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {appsLoading && <div className="loading">Loading applications...</div>}
    </div>
  );
}
