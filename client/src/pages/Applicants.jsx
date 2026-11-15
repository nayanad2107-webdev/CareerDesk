
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  FileText,
  RefreshCw
} from 'lucide-react';

import api from '../api';

const statuses = [
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Rejected'
];

// Convert current local time into datetime-local input format.
const getLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

export default function Applicants() {
  const [params] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(params.get('job') || '');
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState({});

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updating, setUpdating] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load recruiter jobs.
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await api.get('/jobs/mine');
        const recruiterJobs = response.data.jobs || [];

        setJobs(recruiterJobs);

        setJobId(currentId => {
          if (
            currentId &&
            recruiterJobs.some(job => job._id === currentId)
          ) {
            return currentId;
          }

          return recruiterJobs[0]?._id || '';
        });
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load jobs.'
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, []);

  // Load applicants whenever the selected job changes.
  useEffect(() => {
    if (!jobId) {
      setItems([]);
      setLoadingApplicants(false);
      return;
    }

    let active = true;

    const loadApplicants = async () => {
      setLoadingApplicants(true);
      setError('');
      setItems([]);

      try {
        const response = await api.get(
          `/applications/job/${jobId}`
        );

        if (active) {
          setItems(response.data.applications || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load applicants.'
          );
          setItems([]);
        }
      } finally {
        if (active) {
          setLoadingApplicants(false);
        }
      }
    };

    loadApplicants();

    return () => {
      active = false;
    };
  }, [jobId]);

  // Update application status.
  const updateStatus = async (id, status) => {
    setError('');
    setMessage('');
    setUpdating(id);

    try {
      const response = await api.patch(
        `/applications/${id}/status`,
        { status }
      );

      setItems(old =>
        old.map(application =>
          application._id === id
            ? {
                ...application,
                status: response.data.application.status
              }
            : application
        )
      );

      setMessage('Application status updated successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update application status.'
      );
    } finally {
      setUpdating('');
    }
  };

  // Update interview form fields.
  const updateSchedule = (id, field, value) => {
    setSchedule(old => ({
      ...old,
      [id]: {
        ...old[id],
        [field]: value
      }
    }));
  };

  // Create the first interview or update the existing interview.
  const scheduleInterview = async (id) => {
    const data = schedule[id] || {};
    const mode = data.mode || 'Online';

    if (!data.date) {
      setError('Please select an interview date and time.');
      return;
    }

    if (new Date(data.date) <= new Date()) {
      setError('Please select a future interview date and time.');
      return;
    }

    if (mode === 'Online' && !data.meetingLink?.trim()) {
      setError('Please enter the online meeting URL.');
      return;
    }

    if (
      mode === 'Online' &&
      !/^https?:\/\/.+/i.test(data.meetingLink.trim())
    ) {
      setError(
        'Please enter a valid URL starting with https:// or http://.'
      );
      return;
    }

    if (mode === 'In-person' && !data.venue?.trim()) {
      setError('Please enter the interview venue.');
      return;
    }

    setError('');
    setMessage('');
    setUpdating(id);

    const interviewData = {
      date: data.date,
      mode,
      meetingLink: mode === 'Online'
        ? data.meetingLink.trim()
        : '',
      venue: mode === 'In-person'
        ? data.venue.trim()
        : ''
    };

    try {
      let resultMessage;

      try {
        // Try updating the latest existing interview first.
        await api.patch(
          `/interviews/application/${id}`,
          interviewData
        );

        resultMessage = 'Interview details updated successfully.';
      } catch (err) {
        // Create an interview only when no existing interview exists.
        if (
          err.response?.status !== 404 ||
          err.response?.data?.message !== 'No existing interview found.'
        ) {
          throw err;
        }

        await api.post('/interviews', {
          applicationId: id,
          ...interviewData
        });

        resultMessage = 'First interview scheduled successfully.';
      }

      // Synchronize the application status.
      await api.patch(`/applications/${id}/status`, {
        status: 'Interview Scheduled'
      });

      setItems(old =>
        old.map(application =>
          application._id === id
            ? {
                ...application,
                status: 'Interview Scheduled'
              }
            : application
        )
      );

      setMessage(resultMessage);

      setSchedule(old => ({
        ...old,
        [id]: {
          ...old[id],
          date: '',
          meetingLink: '',
          venue: ''
        }
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to save interview details.'
      );
    } finally {
      setUpdating('');
    }
  };

  const selectedJob = jobs.find(job => job._id === jobId);

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">RECRUITER WORKSPACE</span>

        <h1>Applicant Management</h1>

        <p className="muted">
          Review candidates, manage application progress
          and update interview details.
        </p>
      </div>

      <div className="filter-bar">
        <label className="select-label">
          Select job

          <select
            value={jobId}
            onChange={e => {
              setJobId(e.target.value);
              setMessage('');
              setError('');
            }}
          >
            <option value="">Choose a job</option>

            {jobs.map(job => (
              <option value={job._id} key={job._id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadingJobs && (
        <div className="panel empty-state">
          Loading your jobs...
        </div>
      )}

      {!loadingJobs && selectedJob && (
        <div
          className="panel"
          style={{ marginBottom: '20px', padding: '20px' }}
        >
          <h2>{selectedJob.title}</h2>

          <p className="muted">
            {selectedJob.company} | {selectedJob.location}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '12px'
            }}
          >
            <span>
              <Users size={16} style={{ verticalAlign: 'middle' }} />
              {' '}{items.length} Applicants
            </span>

            <span>
              <CalendarDays
                size={16}
                style={{ verticalAlign: 'middle' }}
              />
              {' '}Deadline: {
                selectedJob.deadline
                  ? new Date(selectedJob.deadline).toLocaleDateString('en-IN')
                  : 'Not specified'
              }
            </span>
          </div>
        </div>
      )}

      {message && (
        <div className="alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="applicant-list">
        {loadingApplicants && (
          <div className="panel empty-state">
            <RefreshCw size={20} />
            <p>Loading applicants...</p>
          </div>
        )}

        {!loadingJobs &&
          !loadingApplicants &&
          jobId &&
          items.map(application => {
            const student = application.student || {};
            const interview = schedule[application._id] || {};

            // Preserve Applied as the current value, but do not offer
            // it as a new status because the backend rejects it.
            const availableStatuses = [
              ...new Set([
                application.status,
                ...statuses
              ])
            ];

            return (
              <article
                className="panel applicant-card"
                key={application._id}
              >
                <div className="applicant-head">
                  <div>
                    <h3>{student.name || 'Student'}</h3>

                    <p>
                      {student.email || 'Email unavailable'}
                      {' | '}
                      {student.department || 'Department not provided'}
                      {' | '}
                      CGPA: {student.cgpa ?? 'Not provided'}
                    </p>

                    {student.phone && (
                      <p>Phone: {student.phone}</p>
                    )}
                  </div>

                  <select
                    value={application.status}
                    disabled={updating === application._id}
                    onChange={e =>
                      updateStatus(
                        application._id,
                        e.target.value
                      )
                    }
                  >
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tag-row">
                  {(student.skills || []).map((skill, index) => (
                    <span className="tag" key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}

                  {student.resumeUrl && (
                    <a
                      href={student.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText
                        size={15}
                        style={{ verticalAlign: 'middle' }}
                      />
                      {' '}View resume
                    </a>
                  )}
                </div>

                <div style={{ marginTop: '15px' }}>
                  <p className="muted">
                    Applied on:{' '}
                    {application.appliedAt
                      ? new Date(application.appliedAt)
                          .toLocaleDateString('en-IN')
                      : 'Not available'}
                  </p>

                  {application.coverLetter && (
                    <p style={{ marginTop: '10px' }}>
                      <strong>Cover letter:</strong>{' '}
                      {application.coverLetter}
                    </p>
                  )}
                </div>

                <div
                  className="schedule-row"
                  style={{ marginTop: '20px' }}
                >
                  <label>
                    Interview date & time

                    <input
                      type="datetime-local"
                      min={getLocalDateTime()}
                      value={interview.date || ''}
                      onChange={e =>
                        updateSchedule(
                          application._id,
                          'date',
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Interview mode

                    <select
                      value={interview.mode || 'Online'}
                      onChange={e =>
                        updateSchedule(
                          application._id,
                          'mode',
                          e.target.value
                        )
                      }
                    >
                      <option>Online</option>
                      <option>In-person</option>
                    </select>
                  </label>

                  {(interview.mode || 'Online') === 'In-person' ? (
                    <label>
                      Interview venue

                      <input
                        placeholder="Enter office location"
                        value={interview.venue || ''}
                        onChange={e =>
                          updateSchedule(
                            application._id,
                            'venue',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  ) : (
                    <label>
                      Meeting link

                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={interview.meetingLink || ''}
                        onChange={e =>
                          updateSchedule(
                            application._id,
                            'meetingLink',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    className="btn secondary"
                    disabled={
                      !interview.date ||
                      updating === application._id
                    }
                    onClick={() =>
                      scheduleInterview(application._id)
                    }
                  >
                    {updating === application._id
                      ? 'Saving...'
                      : 'Save interview details'}
                  </button>
                </div>
              </article>
            );
          })}

        {!loadingJobs &&
          !loadingApplicants &&
          jobId &&
          items.length === 0 && (
            <div className="panel empty-state">
              No applications have been submitted for this job yet.
            </div>
          )}

        {!loadingJobs && !jobId && (
          <div className="panel empty-state">
            No jobs available. Publish a job first to view applicants.
          </div>
        )}
      </div>
    </>
  );
}
