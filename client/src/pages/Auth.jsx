import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }) {
  const isRegister = mode === 'register'; const { login, register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = e => setForm({...form,[e.target.name]:e.target.value});
  const submit = async e => { e.preventDefault(); setError(''); setBusy(true); try { if (isRegister) await register(form); else await login({email:form.email,password:form.password}); navigate('/'); } catch(err) { setError(err.response?.data?.message || 'Something went wrong.'); } finally { setBusy(false); } };
  return <div className="auth-page"><section className="auth-visual"><div className="auth-brand"><span className="brand-mark">C</span> CareerDesk</div><div className="visual-copy"><span className="eyebrow light">YOUR NEXT CHAPTER STARTS HERE</span><h1>Build your future.<br/><em>Find your place.</em></h1><p>One workspace for students, recruiters and placement teams to move opportunities forward.</p><div className="visual-stat"><strong>One platform.</strong><span>Every opportunity, organized.</span></div></div><div className="visual-footer">CAREERDESK · PLACEMENT MANAGEMENT</div></section>
    <section className="auth-panel"><div className="auth-card"><div className="auth-icon"><BriefcaseBusiness/></div><h2>{isRegister?'Create your account':'Welcome back'}</h2><p className="muted">{isRegister?'Join your campus placement workspace.':'Sign in to continue to your workspace.'}</p>
      {error && <div className="alert error">{error}</div>}<form onSubmit={submit} className="form-stack">
        {isRegister && <><label>Full name<input name="name" value={form.name} onChange={change} required placeholder="Your full name"/></label><label>Account type<select name="role" value={form.role} onChange={change}><option value="student">Student</option><option value="recruiter">Recruiter</option></select></label></>}
        <label>Email address<input name="email" type="email" value={form.email} onChange={change} required placeholder="you@example.com"/></label>
        <label>Password<input name="password" type="password" minLength="8" value={form.password} onChange={change} required placeholder="At least 8 characters"/></label>
        <button className="btn primary full" disabled={busy}>{busy?'Please wait…':isRegister?'Create account':'Sign in'} <ArrowRight size={17}/></button>
      </form><p className="auth-switch">{isRegister?'Already have an account?':'New to CareerDesk?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create an account'}</Link></p>
      <div className="security-note">Secure access · Role-based workspace</div></div></section></div>;
}
