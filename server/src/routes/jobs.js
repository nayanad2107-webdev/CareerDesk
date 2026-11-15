import express from 'express';
import asyncHandler from 'express-async-handler';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/', asyncHandler(async (req, res) => {
  const { search = '', location = '', type = '', sort = 'newest', page = 1, limit = 8 } = req.query;
  const today = new Date();
today.setHours(0, 0, 0, 0);

const filter = { status: 'Open', deadline: { $gte: today } };
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { company: { $regex: search, $options: 'i' } },
    { skills: { $regex: search, $options: 'i' } }
  ];
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.jobType = type;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 8));
  const sortBy = sort === 'deadline' ? { deadline: 1 } : { createdAt: -1 };
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('createdBy', 'name company').sort(sortBy).skip((pageNum - 1) * pageSize).limit(pageSize),
    Job.countDocuments(filter)
  ]);
  res.json({ jobs, pagination: { page: pageNum, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
}));
// Get jobs belonging to the logged-in recruiter
router.get('/mine', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? {}
    : { createdBy: req.user._id };

  const jobs = await Job.find(filter)
    .populate('createdBy', 'name company')
    .sort({ createdAt: -1 });

  res.json({ jobs });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('createdBy', 'name company');
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  res.json({ job });
}));
router.post('/', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const required = ['title', 'company', 'description', 'location', 'deadline'];
  const missing = required.find((key) => !req.body[key]);
  if (missing) return res.status(400).json({ message: `${missing} is required.` });
  const job = await Job.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ job });
}));
router.put('/:id', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (req.user.role !== 'admin' && String(job.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'You can edit only your own jobs.' });
  Object.assign(job, req.body);
  await job.save();
  res.json({ job });
}));
router.delete('/:id', protect, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (req.user.role !== 'admin' && String(job.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'You can delete only your own jobs.' });
  await job.deleteOne();
  await Application.deleteMany({ job: job._id });
  res.json({ message: 'Job and related applications deleted.' });
}));
export default router;
