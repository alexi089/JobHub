import { useQuery } from '@tanstack/react-query';
import { interviewsApi } from '../api/client';
import type { Interview } from '../types';

export default function InterviewCalendar() {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews', 'upcoming'],
    queryFn: () => interviewsApi.list(true),
  });

  if (isLoading) {
    return (
      <div className="card">
        <h2>Upcoming Interviews</h2>
        <div className="loading">Loading interviews...</div>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="card">
        <h2>Upcoming Interviews</h2>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px 0' }}>
          No upcoming interviews scheduled
        </p>
      </div>
    );
  }

  const groupedInterviews = groupByDate(interviews);

  return (
    <div className="card">
      <h2>Upcoming Interviews ({interviews.length})</h2>
      <div style={{ marginTop: '20px' }}>
        {Object.entries(groupedInterviews).map(([date, dayInterviews]) => (
          <div key={date} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '2px solid var(--primary-light)'
            }}>
              {formatDateHeader(date)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const time = new Date(interview.interview_date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div style={{
      background: 'var(--background)',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--primary)';
      e.currentTarget.style.transform = 'translateX(4px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateX(0)';
    }}
    >
      <div style={{
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        minWidth: '70px',
        textAlign: 'center'
      }}>
        {time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
          {interview.company_name}
        </div>
        <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '8px' }}>
          {interview.job_title}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
          {interview.interview_type && (
            <span style={{
              background: 'white',
              padding: '4px 10px',
              borderRadius: '6px',
              color: 'var(--text)',
              border: '1px solid var(--border)'
            }}>
              {interview.interview_type}
            </span>
          )}
          {interview.location && (
            <span style={{
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📍 {interview.location}
            </span>
          )}
        </div>
        {interview.notes && (
          <div style={{
            marginTop: '8px',
            fontSize: '13px',
            color: 'var(--text-light)',
            fontStyle: 'italic'
          }}>
            {interview.notes}
          </div>
        )}
      </div>
    </div>
  );
}

function groupByDate(interviews: Interview[]): Record<string, Interview[]> {
  const grouped: Record<string, Interview[]> = {};

  interviews.forEach((interview) => {
    const date = new Date(interview.interview_date).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(interview);
  });

  return grouped;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}
