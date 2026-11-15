import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import ManageJobs from './pages/ManageJobs';
import Applicants from './pages/Applicants';
import Interviews from './pages/Interviews';
import Users from './pages/Users';
import './styles.css';

function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Auth mode="login"/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<Layout/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="jobs" element={<Jobs/>}/>
        <Route path="profile" element={<Profile/>}/>
        <Route path="interviews" element={<Interviews/>}/>
        <Route element={<ProtectedRoute roles={['student']}/>}>
          <Route path="my-applications" element={<Applications/>}/>
        </Route>
        <Route element={<ProtectedRoute roles={['recruiter','admin']}/>}>
          <Route path="manage-jobs" element={<ManageJobs/>}/>
          <Route path="applicants" element={<Applicants/>}/>
        </Route>
        <Route element={<ProtectedRoute roles={['admin']}/>}>
          <Route path="users" element={<Users/>}/>
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></BrowserRouter></AuthProvider>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
