import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { publicUser } from '../utils/token.js';

const router = express.Router();
router.get('/profile', protect, (req, res) => res.json({ user: publicUser(req.user) }));
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'department', 'graduationYear', 'cgpa', 'skills', 'resumeUrl', 'company'];
  for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}));
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { role, search = '', page = 1 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const limit = 20;
  const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((Number(page) - 1) * limit).limit(limit), User.countDocuments(filter)]);
  res.json({ users: users.map(publicUser), total, pages: Math.ceil(total / limit) });
}));
router.patch('/:id/role', protect, authorize('admin'), asyncHandler(async (req, res) => {
  if (!['student', 'recruiter', 'admin'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid role.' });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: publicUser(user) });
}));
export default router;
