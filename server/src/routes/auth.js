import express from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { createToken, publicUser } from '../utils/token.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['student', 'recruiter']).withMessage('Invalid role.'),
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, role = 'student' } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered.' });
    // Public registration deliberately cannot create Admin accounts.
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
  })
);

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  res.json({ token: createToken(user._id), user: publicUser(user) });
}));

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
