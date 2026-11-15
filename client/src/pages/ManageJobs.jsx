
import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, Pencil, Power } from 'lucide-react';

const blank = {
  title: '',
  company: '',
  description: '',
  location: 'Bengaluru',
  jobType: 'Full-time',
  workMode: 'Hybrid',
  salary: '',
  minCgpa: 0,
  eligibleDepartments: '',
  eligibleGraduationYears: '',
  skills: '',
  deadline: ''
};

const toForm = (job) => ({
  title: job.title || '',
  company: job.company || '',
  description: job.description || '',
  location: job.location || '',
  jobType: job.jobType || 'Full-time',
  workMode: job.workMode || 'Hybrid',
  salary: job.salary || '',
  minCgpa: job.minCgpa ?? 0,
  eligibleDepartments: (job.eligibleDepartments || []).join(', '),
  eligibleGraduationYears: (job.eligibleGraduationYears || []).join(', '),
  skills: (job.skills || []).join(', '),
  deadline: job.deadline
    ? new Date(job.deadline).toISOString().slice(0, 10)
    : ''
});

const toPayload = (form) => ({
  ...form,
  minCgpa: Number(form.minCgpa),
  eligibleDepartments: form.eligibleDepartments
    .split(',').map(x => x.trim()).filter(Boolean),
  eligibleGraduationYears: form.eligibleGraduationYears
    .split(',').map(x => Number(x.trim()))
    .filter(x => Number.isFinite(x) && x > 0),
  skills: form.skills
    .split(',').map(x => x.trim()).filter(Boolean)
});

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/jobs/mine');
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => {
    setForm(previous => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...blank });
    setShow(true);
    setError('');
    setMessage('');
  };

  const openEdit = (job) => {
    setEditingId(job._id);
    setForm(toForm(job));
    setShow(true);
    setError('');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShow(false);
    setEditingId(null);
    setForm({ ...blank });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const jobData = toPayload(form);

      if (editingId) {
        await api.put(`/jobs/${editingId}`, jobData);
        setMessage('Job updated successfully!');
      } else {
        await api.post('/jobs', jobData);
        setMessage('Job published successfully!');
      }

      setShow(false);
      setEditingId(null);
      setForm({ ...blank });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save job.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (job) => {
    const nextStatus = job.status === 'Open' ? 'Closed' : 'Open';

    if (!window.confirm(`Change "${job.title}" to ${nextStatus}?`)) return;

    setError('');
    setMessage('');

    try {
      await api.put(`/jobs/${job._id}`, { status: nextStatus });
      setMessage(`Job marked as ${nextStatus}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update job status.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm(
      'Delete this job and all its related applications? This cannot be undone.'
    )) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/jobs/${id}`);
      setMessage('Job and related applications deleted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete this job.');
    }
  };

  return (
    <>
      <div className="page-title page-title-action">
        <div>
          <span className="eyebrow">RECRUITER WORKSPACE</span>
          <h1>Manage jobs</h1>
          <p className="muted">
            Create, edit and manage your published opportunities.
          </p>
        </div>

        <button className="btn primary" onClick={openCreate}>
          <Plus size={17} />
          Create job
        </button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {show && (
        <form className="panel create-form" onSubmit={submit}>
          <h2>{editingId ? 'Edit opportunity' : 'New opportunity'}</h2>

          <div className="profile-form">
            {[
              ['title', 'Job title'],
              ['company', 'Company'],
              ['location', 'Location'],
              ['salary', 'Salary / stipend'],
              ['deadline', 'Application deadline'],
              ['minCgpa', 'Minimum CGPA'],
              ['eligibleDepartments', 'Eligible departments (comma separated)'],
              ['eligibleGraduationYears', 'Eligible graduation years (comma separated)'],
              ['skills', 'Required skills (comma separated)']
            ].map(([name, label]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type={
                    name === 'deadline' ? 'date' :
                    name === 'minCgpa' ? 'number' : 'text'
                  }
                  min={name === 'minCgpa' ? '0' : undefined}
                  max={name === 'minCgpa' ? '10' : undefined}
                  step={name === 'minCgpa' ? '0.01' : undefined}
                  value={form[name]}
                  onChange={change}
                  required={[
                    'title', 'company', 'location',
                    'deadline', 'description'
                  ].includes(name)}
                />
              </label>
            ))}

            <label>
              Job type
              <select name="jobType" value={form.jobType} onChange={change}>
                <option>Full-time</option>
                <option>Internship</option>
                <option>Part-time</option>
              </select>
            </label>

            <label>
              Work mode
              <select name="workMode" value={form.workMode} onChange={change}>
                <option>On-site</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </label>
          </div>

          <label className="description-label">
            Description
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={change}
              required
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={cancelForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId ? 'Save changes' : 'Publish job'}
            </button>
          </div>
        </form>
      )}

      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>POSITION</th>
                <th>COMPANY</th>
                <th>DEADLINE</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {!loading && jobs.map(job => (
                <tr key={job._id}>
                  <td><strong>{job.title}</strong></td>
                  <td>{job.company}</td>
                  <td>
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td>{job.jobType}</td>
                  <td>
                    <span className={`status status-${(job.status || 'open').toLowerCase()}`}>
                      {job.status || 'Open'}
                    </span>
                  </td>
                  <td>
                    <a
                      className="table-link"
                      href={`/applicants?job=${job._id}`}
                    >
                      Applicants
                    </a>

                    <button
                      type="button"
                      className="icon-button"
                      title="Edit job"
                      onClick={() => openEdit(job)}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="icon-button"
                      title={job.status === 'Open' ? 'Close job' : 'Reopen job'}
                      onClick={() => toggleStatus(job)}
                    >
                      <Power size={17} />
                    </button>

                    <button
                      type="button"
                      className="icon-button danger"
                      title="Delete job"
                      onClick={() => remove(job._id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="empty-state">Loading your jobs...</div>}

        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            No jobs published yet. Create your first opportunity.
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="empty-state">
            Total jobs: <strong>{jobs.length}</strong>
          </div>
        )}
      </div>
    </>
  );
}
