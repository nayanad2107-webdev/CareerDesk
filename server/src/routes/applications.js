import express from 'express';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/:jobId', protect, authorize('student'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  const today = new Date();
today.setHours(0, 0, 0, 0);

if (!job || job.status !== 'Open' || new Date(job.deadline) < today) {
  return res.status(404).json({ message: 'This job is not accepting applications.' });
}
  const student = req.user;
  if (student.cgpa == null || student.cgpa < job.minCgpa) return res.status(400).json({ message: `Minimum CGPA required: ${job.minCgpa}. Update your profile if this information is missing.` });
  if (job.eligibleDepartments.length && !job.eligibleDepartments.includes(student.department)) return res.status(400).json({ message: 'Your department is not eligible for this job.' });
  if (job.eligibleGraduationYears.length && !job.eligibleGraduationYears.includes(student.graduationYear)) return res.status(400).json({ message: 'Your graduation year is not eligible for this job.' });
  const application = await Application.create({ student: student._id, job: job._id, coverLetter: req.body.coverLetter || '' });
  res.status(201).json({ application });
}));
router.get('/mine', protect, authorize('student'), asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id }).populate('job').sort({ createdAt: -1 });
  res.json({ applications });
}));
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (req.user.role !== 'admin' && String(job.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'Access denied.' });
  const applications = await Application.find({ job: job._id }).populate('student', 'name email phone department graduationYear cgpa skills resumeUrl').sort({ appliedAt: -1 });
  res.json({ applications });
}));
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const allowed = ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status.' });
  const application = await Application.findById(req.params.id).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  if (req.user.role !== 'admin' && String(application.job.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'Access denied.' });
  application.status = req.body.status;
  application.reviewedAt = new Date();
  await application.save();
  res.json({ application });
}));
export default router;
