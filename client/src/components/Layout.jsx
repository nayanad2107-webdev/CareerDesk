import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, LayoutDashboard, UserRound, FileText, CalendarDays, LogOut, Users, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, roles: ['student','recruiter','admin'] },
    { to: '/jobs', label: 'Explore jobs', icon: BriefcaseBusiness, roles: ['student','admin'] },
    { to: '/my-applications', label: 'My applications', icon: FileText, roles: ['student'] },
    { to: '/manage-jobs', label: 'Manage jobs', icon: PlusCircle, roles: ['recruiter','admin'] },
    { to: '/applicants', label: 'Applicants', icon: Users, roles: ['recruiter','admin'] },
    { to: '/interviews', label: 'Interviews', icon: CalendarDays, roles: ['student','recruiter','admin'] },
    { to: '/profile', label: 'My profile', icon: UserRound, roles: ['student','recruiter','admin'] },
    { to: '/users', label: 'Users', icon: Users, roles: ['admin'] }
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">C</span><span>CareerDesk<small>PLACEMENT PORTAL</small></span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{links.filter(l => l.roles.includes(user?.role)).map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/'}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div><strong>{user?.name}</strong><small>{user?.role}</small></div></div><button className="logout" onClick={() => {logout();navigate('/login');}}><LogOut size={17}/> Sign out</button></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="eyebrow">CAREER MANAGEMENT</span><strong>Placement & Job Management</strong></div><div className="top-user">{user?.name}<span className="role-pill">{user?.role}</span></div></header><div className="page-content"><Outlet/></div></main>
  </div>;
}
