
import { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [message, setMessage] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);

  const load = () => {
    api.get('/jobs', {
      params: { search: query, location, type, sort, page, limit: 6 }
    })
      .then(r => {
        setJobs(r.data.jobs);
        setPages(r.data.pagination.pages || 1);
      })
      .catch(() => setMessage('Could not load jobs.'));
  };

  useEffect(() => {
    load();
  }, [query, location, type, sort, page]);

  // Load the student's previous applications
  useEffect(() => {
    if (user?.role !== 'student') return;

    api.get('/applications/mine')
      .then(r => {
        const ids = new Set(
          r.data.applications.map(application => application.job?._id)
        );
        setAppliedIds(ids);
      })
      .catch(() => console.error('Could not load previous applications.'));
  }, [user]);

  // Submit a job application
  const apply = async (job) => {
    setMessage('');
    setApplyingId(job._id);

    try {
      await api.post(`/applications/${job._id}`, {});

      setAppliedIds(previous => new Set([...previous, job._id]));

      setMessage(
        `Success! You have successfully applied for ${job.title} at ${job.company}.`
      );
    } catch (e) {
      setMessage(
        e.response?.data?.message || 'Unable to submit your application.'
      );
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">OPPORTUNITIES</span>
          <h1>Explore jobs</h1>
          <p className="muted">
            Discover roles and internships that match your ambitions.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <Search size={18} />
          <input
            placeholder="Search title, company or skill"
            value={query}
            onChange={e => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
        </div>

        <div className="search-field compact">
          <MapPin size={17} />
          <input
            placeholder="Location"
            value={location}
            onChange={e => {
              setPage(1);
              setLocation(e.target.value);
            }}
          />
        </div>

        <select
          value={type}
          onChange={e => {
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="">All types</option>
          <option>Full-time</option>
          <option>Internship</option>
          <option>Part-time</option>
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="deadline">Closing soon</option>
        </select>
      </div>

      {message && (
        <div className="alert success" role="status">
          <CheckCircle size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
          {message}
        </div>
      )}

      <div className="jobs-list">
        {jobs.map(job => {
          const alreadyApplied = appliedIds.has(job._id);

          return (
            <article className="job-card" key={job._id}>
              <div className="job-company-icon">
                {job.company?.[0]}
              </div>

              <div className="job-content">
                <div className="job-heading">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>
                  <span className="job-type">{job.jobType}</span>
                </div>

                <div className="job-meta">
                  <span>
                    <MapPin size={15} />
                    {job.location}
                  </span>
                  <span>
                    <BriefcaseBusiness size={15} />
                    {job.workMode}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    Apply by {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>

                <p className="job-description">{job.description}</p>

                <div className="tag-row">
                  {(job.skills || []).slice(0, 5).map(s => (
                    <span className="tag" key={s}>{s}</span>
                  ))}
                  <span className="salary-tag">{job.salary}</span>
                </div>
              </div>

              {user?.role === 'student' && (
                <button
                  className={`btn ${alreadyApplied ? 'secondary' : 'primary'} apply-btn`}
                  disabled={alreadyApplied || applyingId === job._id}
                  onClick={() => apply(job)}
                >
                  {alreadyApplied ? (
                    <>
                      <CheckCircle size={15} />
                      Already Applied
                    </>
                  ) : applyingId === job._id ? (
                    'Submitting...'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )}
            </article>
          );
        })}

        {jobs.length === 0 && (
          <div className="panel empty-state">
            No matching jobs found. Try changing your search filters.
          </div>
        )}
      </div>

      <div className="pagination">
        <span>Page {page} of {pages}</span>

        <div>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={17} />
          </button>

          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
