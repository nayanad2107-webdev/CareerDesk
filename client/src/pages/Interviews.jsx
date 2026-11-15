
import { useEffect, useState } from 'react';
import api from '../api';

export default function Interviews() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await api.get('/interviews/mine');

        const interviews = response.data.interviews || [];

        // Keep only one interview per application.
        // Prefer the most recently updated record.
        const uniqueInterviews = new Map();

        interviews.forEach(interview => {
          const applicationId =
            interview.application?._id || interview.application;

          if (!applicationId) return;

          const existing = uniqueInterviews.get(applicationId);

          if (
            !existing ||
            new Date(interview.updatedAt || interview.createdAt) >
            new Date(existing.updatedAt || existing.createdAt)
          ) {
            uniqueInterviews.set(applicationId, interview);
          }
        });

        setItems(
          Array.from(uniqueInterviews.values()).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          )
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load interviews.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">SCHEDULE</span>

        <h1>Interviews</h1>

        <p className="muted">
          Your interview schedule and meeting details.
        </p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading && (
        <div className="panel empty-state">
          Loading your interviews...
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="interview-grid">
            {items.map(interview => {
              const date = new Date(interview.date);

              const meetingLink = interview.meetingLink?.trim();

              const validMeetingLink =
                meetingLink &&
                /^https?:\/\/.+/i.test(meetingLink);

              return (
                <div
                  className="panel interview-card"
                  key={interview._id}
                >
                  <div className="interview-date">
                    <strong>
                      {date.toLocaleDateString('en-IN', {
                        day: '2-digit'
                      })}
                    </strong>

                    <span>
                      {date.toLocaleDateString('en-IN', {
                        month: 'short'
                      })}
                    </span>
                  </div>

                  <div>
                    <h3>
                      {interview.application?.job?.title || 'Interview'}
                    </h3>

                    <p>
                      {interview.application?.job?.company || 'Company'}
                      {' · '}
                      {interview.application?.student?.name || 'Candidate'}
                    </p>

                    <p>
                      <strong>Time: </strong>
                      {date.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>

                    <span className="tag">
                      {interview.mode || 'Online'}
                    </span>

                    {interview.mode === 'Online' && validMeetingLink && (
                      <p style={{ marginTop: '12px' }}>
                        <a
                          href={meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn primary"
                        >
                          Join meeting
                        </a>
                      </p>
                    )}

                    {interview.mode === 'Online' && !validMeetingLink && (
                      <p className="muted" style={{ marginTop: '12px' }}>
                        Meeting link has not been provided yet.
                      </p>
                    )}

                    {interview.venue && (
                      <p style={{ marginTop: '10px' }}>
                        <strong>Venue: </strong>
                        {interview.venue}
                      </p>
                    )}

                    {interview.notes && (
                      <p style={{ marginTop: '10px' }}>
                        <strong>Notes: </strong>
                        {interview.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!items.length && (
            <div className="panel empty-state">
              No interviews have been scheduled for your account.
            </div>
          )}
        </>
      )}
    </>
  );
}
