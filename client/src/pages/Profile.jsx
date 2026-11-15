
import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    department: '',
    graduationYear: '',
    cgpa: '',
    skills: '',
    resumeUrl: '',
    company: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        const profile = data.user;

        setForm({
          name: profile.name || '',
          phone: profile.phone || '',
          department: profile.department || '',
          graduationYear: profile.graduationYear ?? '',
          cgpa: profile.cgpa ?? '',
          skills: (profile.skills || []).join(', '),
          resumeUrl: profile.resumeUrl || '',
          company: profile.company || ''
        });
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load your profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const change = (e) => {
    setForm(previous => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const graduationYear = form.graduationYear
      ? Number(form.graduationYear)
      : undefined;

    const cgpa = form.cgpa !== ''
      ? Number(form.cgpa)
      : undefined;

    if (graduationYear !== undefined &&
        (!Number.isInteger(graduationYear) ||
         graduationYear < 2000 ||
         graduationYear > 2100)) {
      setError('Enter a valid graduation year.');
      return;
    }

    if (cgpa !== undefined &&
        (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) {
      setError('CGPA must be between 0 and 10.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        graduationYear,
        cgpa,
        skills: form.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean),
        resumeUrl: form.resumeUrl.trim(),
        company: form.company.trim()
      };

      const { data } = await api.put('/users/profile', payload);

      setUser(data.user);

      setForm(previous => ({
        ...previous,
        skills: (data.user.skills || []).join(', ')
      }));

      setMessage('Profile saved successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading your profile...</div>;
  }

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">PERSONAL DETAILS</span>
        <h1>My profile</h1>
        <p className="muted">
          Keep your information accurate so opportunities can be matched correctly.
        </p>
      </div>

      <div className="panel profile-panel">
        <div className="profile-intro">
          <div className="profile-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <div>
            <h2>{user?.name}</h2>
            <p>
              {user?.email} · <span className="role-pill">{user?.role}</span>
            </p>
          </div>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form className="profile-form" onSubmit={submit}>
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Enter your full name"
              maxLength={80}
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={change}
              placeholder="Enter your phone number"
            />
          </label>

          {user?.role === 'student' && (
            <>
              <label>
                Department
                <input
                  name="department"
                  value={form.department}
                  onChange={change}
                  placeholder="Example: ECE"
                />
              </label>

              <label>
                Graduation year
                <input
                  name="graduationYear"
                  type="number"
                  min="2000"
                  max="2100"
                  step="1"
                  value={form.graduationYear}
                  onChange={change}
                  placeholder="Example: 2027"
                />
              </label>

              <label>
                CGPA
                <input
                  name="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={form.cgpa}
                  onChange={change}
                  placeholder="Example: 8.83"
                />
              </label>

              <label>
                Skills (comma separated)
                <input
                  name="skills"
                  value={form.skills}
                  onChange={change}
                  placeholder="Python, React, SQL"
                />
              </label>

              <label>
                Resume URL
                <input
                  name="resumeUrl"
                  type="url"
                  value={form.resumeUrl}
                  onChange={change}
                  placeholder="https://example.com/resume.pdf"
                />
              </label>
            </>
          )}

          {user?.role === 'recruiter' && (
            <label>
              Company
              <input
                name="company"
                value={form.company}
                onChange={change}
                placeholder="Enter your company name"
              />
            </label>
          )}

          <button
            type="submit"
            className="btn primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </>
  );
}
