
import express from 'express';
import asyncHandler from 'express-async-handler';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Schedule a new interview
router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  asyncHandler(async (req, res) => {
    const { applicationId, date, mode, meetingLink, venue, notes } = req.body;

    if (!applicationId || !date || new Date(date) <= new Date()) {
      return res.status(400).json({
        message: 'A future interview date and application are required.'
      });
    }

    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      String(application.job.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const interview = await Interview.create({
      application: applicationId,
      date,
      mode,
      meetingLink,
      venue,
      notes,
      scheduledBy: req.user._id
    });

    application.status = 'Interview Scheduled';
    await application.save();

    res.status(201).json({ interview });
  })
);

// Update the latest existing interview for an application
router.patch(
  '/application/:applicationId',
  protect,
  authorize('recruiter', 'admin'),
  asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { date, mode, meetingLink, venue, notes } = req.body;

    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      String(application.job.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const interview = await Interview.findOne({
      application: applicationId
    }).sort({ createdAt: -1 });

    if (!interview) {
      return res.status(404).json({ message: 'No existing interview found.' });
    }

    if (date && new Date(date) <= new Date()) {
      return res.status(400).json({
        message: 'Please select a future interview date and time.'
      });
    }

    if (date !== undefined) interview.date = date;
    if (mode !== undefined) interview.mode = mode;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (venue !== undefined) interview.venue = venue;
    if (notes !== undefined) interview.notes = notes;

    await interview.save();

    res.json({
      message: 'Interview updated successfully.',
      interview
    });
  })
);

// Get interviews for the logged-in user
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    let applicationIds;

    if (req.user.role === 'student') {
      const apps = await Application.find({
        student: req.user._id
      }).select('_id');

      applicationIds = apps.map(a => a._id);
    }

    const filter = applicationIds
      ? { application: { $in: applicationIds } }
      : {};

    if (req.user.role === 'recruiter') {
      filter.scheduledBy = req.user._id;
    }

    const interviews = await Interview.find(filter)
      .populate({
        path: 'application',
        populate: [
          { path: 'student', select: 'name email' },
          { path: 'job', select: 'title company' }
        ]
      })
      .sort({ date: 1 });

    res.json({ interviews });
  })
);

export default router;
