
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Users,
  FileText,
  CalendarDays,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState({});
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((r) => setSummary(r.data.summary))
      .catch((e) => {
        setError(
          e.response?.data?.message || 'Unable to load dashboard.'
        );
      });

    if (user?.role === 'student') {
      api.get('/applications/mine')
        .then((r) => setRecent(r.data.applications.slice(0, 4)))
        .catch(() => {});
    }
  }, [user]);

  // Dashboard statistics based on user role
  const configs = user?.role === 'student'
    ? [
        [
          'Applications',
          summary.applications || 0,
          FileText,
          'Track every opportunity you apply to.'
        ],
        [
          'Interviews',
          summary.interviews || 0,
          CalendarDays,
          'Upcoming interview-stage applications.'
        ],
        [
          'Shortlisted',
          summary.shortlisted || 0,
          Sparkles,
          'Applications where you have been shortlisted.'
        ],
        [
          'Selected',
          summary.selected || 0,
          Users,
          'Opportunities where you have been selected.'
        ],
        [
          'Open Jobs',
          summary.openJobs || 0,
          BriefcaseBusiness,
          'Explore currently available opportunities.'
        ]
      ]
    : user?.role === 'recruiter'
    ? [
        [
          'Active jobs',
          summary.jobs || 0,
          BriefcaseBusiness,
          'Opportunities you have published.'
        ],
        [
          'Applicants',
          summary.applicants || 0,
          Users,
          'Students interested in your roles.'
        ],
        [
          'Shortlisted',
          summary.shortlisted || 0,
          Sparkles,
          'Candidates moved to shortlist.'
        ]
      ]
    : [
        [
          'Students',
          summary.students || 0,
          Users,
          'Registered student accounts.'
        ],
        [
          'Recruiters',
          summary.recruiters || 0,
          BriefcaseBusiness,
          'Recruiter accounts on the platform.'
        ],
        [
          'Jobs',
          summary.jobs || 0,
          FileText,
          'All published opportunities.'
        ],
        [
          'Applications',
          summary.applications || 0,
          CalendarDays,
          'Applications submitted.'
        ]
      ];

  return (
    <>
      {/* Welcome Section */}
      <div className="welcome-row">
        <div>
          <span className="eyebrow">YOUR OVERVIEW</span>

          <h1>
            Good to see you, {user?.name?.split(' ')[0]}.
          </h1>

          <p className="muted">
            Here’s what’s happening in your placement workspace.
          </p>
        </div>

        <span className="welcome-icon">
          <Sparkles />
        </span>
      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {/* Dashboard Statistics */}
      <div className="stats-grid">
        {configs.map(([label, value, Icon, desc]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>

              <span className="stat-icon">
                <Icon size={19} />
              </span>
            </div>

            <strong className="stat-number">
              {value}
            </strong>

            <p>{desc}</p>
          </div>
        ))}
      </div>

      {/* Application Status Analytics */}
      {user?.role === 'student' && (
        <div
          className="panel"
          style={{ marginTop: '24px', padding: '24px' }}
        >
          <div className="section-heading">
            <div>
              <h2>Application Status Analytics</h2>
              <p className="muted">
                Track the progress of all your applications.
              </p>
            </div>
          </div>

          {(() => {
            const statuses = [
              'Applied',
              'Under Review',
              'Shortlisted',
              'Interview Scheduled',
              'Selected',
              'Rejected'
            ];

            const breakdown = summary.statusBreakdown || [];

            const counts = statuses.map((status) => ({
              name: status,
              count:
                breakdown.find((item) => item._id === status)?.count || 0
            }));

            const maxCount = Math.max(
              ...counts.map((item) => item.count),
              1
            );

            return (
              <div style={{ display: 'grid', gap: '18px' }}>
                {counts.map((item) => (
                  <div key={item.name}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '7px'
                      }}
                    >
                      <strong>{item.name}</strong>
                      <strong>{item.count}</strong>
                    </div>

                    <div
                      style={{
                        height: '10px',
                        background: 'var(--border, #e5e7eb)',
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          height: '100%',
                          background: '#6366f1',
                          borderRadius: '20px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Recent Applications / Quick Actions */}
      <div className="section-heading">
        <div>
          <h2>
            {user?.role === 'student'
              ? 'Your application activity'
              : 'Quick actions'}
          </h2>

          <p className="muted">
            {user?.role === 'student'
              ? 'A snapshot of your recent applications.'
              : 'Jump back into your placement tasks.'}
          </p>
        </div>
      </div>

      {user?.role === 'student' ? (
        <div className="panel">
          {recent.length === 0 ? (
            <div className="empty-state">
              No applications yet.{' '}
              <Link to="/jobs">
                Explore open jobs
              </Link>{' '}
              to get started.
            </div>
          ) : (
            recent.map((a) => (
              <div className="activity-row" key={a._id}>
                <div className="company-avatar">
                  {a.job?.company?.[0] || 'J'}
                </div>

                <div className="activity-main">
                  <strong>
                    {a.job?.title || 'Job unavailable'}
                  </strong>

                  <span>{a.job?.company}</span>
                </div>

                <span
                  className={`status status-${a.status
                    ?.toLowerCase()
                    .replaceAll(' ', '-')}`}
                >
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="quick-grid">
          {(user?.role === 'recruiter'
            ? [
                [
                  'Create a job',
                  'Publish a new opportunity',
                  '/manage-jobs',
                  BriefcaseBusiness
                ],
                [
                  'Review interviews',
                  'See your interview schedule',
                  '/interviews',
                  CalendarDays
                ]
              ]
            : user?.role === 'admin'
            ? [
                [
                  'Manage users',
                  'Review platform accounts',
                  '/users',
                  Users
                ],
                [
                  'View jobs',
                  'Explore published opportunities',
                  '/jobs',
                  BriefcaseBusiness
                ]
              ]
            : [
                [
                  'Explore jobs',
                  'Find opportunities that fit your goals',
                  '/jobs',
                  BriefcaseBusiness
                ],
                [
                  'Complete profile',
                  'Keep your details up to date',
                  '/profile',
                  Users
                ]
              ]
          ).map(([title, desc, to, Icon]) => (
            <Link
              to={to}
              className="quick-card"
              key={title}
            >
              <span className="quick-icon">
                <Icon />
              </span>

              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>

              <ArrowUpRight className="quick-arrow" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
