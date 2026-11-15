
import express from 'express';
import asyncHandler from 'express-async-handler';

import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Dashboard Summary API
router.get(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const role = req.user.role;

    // STUDENT DASHBOARD
    if (role === 'student') {
      const studentId = req.user._id;

      const [
        applications,
        interviews,
        shortlisted,
        selected,
        openJobs,
        statusBreakdown
      ] = await Promise.all([

        // Total applications
        Application.countDocuments({
          student: studentId
        }),

        // Interview scheduled applications
        Application.countDocuments({
          student: studentId,
          status: 'Interview Scheduled'
        }),

        // Shortlisted applications
        Application.countDocuments({
          student: studentId,
          status: 'Shortlisted'
        }),

        // Selected applications
        Application.countDocuments({
          student: studentId,
          status: 'Selected'
        }),

        // Currently open jobs
        Job.countDocuments({
          status: 'Open',
          deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),

        // Application status breakdown
        Application.aggregate([
          {
            $match: {
              student: studentId
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ])
      ]);

      return res.json({
        summary: {
          applications,
          interviews,
          shortlisted,
          selected,
          openJobs,
          statusBreakdown
        }
      });
    }

    // RECRUITER DASHBOARD
    if (role === 'recruiter') {
      const jobs = await Job.find({
        createdBy: req.user._id
      }).select('_id');

      const ids = jobs.map(job => job._id);

      const [
        jobCount,
        applicants,
        shortlisted
      ] = await Promise.all([

        Job.countDocuments({
          createdBy: req.user._id
        }),

        Application.countDocuments({
          job: { $in: ids }
        }),

        Application.countDocuments({
          job: { $in: ids },
          status: 'Shortlisted'
        })
      ]);

      return res.json({
        summary: {
          jobs: jobCount,
          applicants,
          shortlisted
        }
      });
    }

    // ADMIN DASHBOARD
    const [
      students,
      recruiters,
      jobs,
      applications
    ] = await Promise.all([

      User.countDocuments({
        role: 'student'
      }),

      User.countDocuments({
        role: 'recruiter'
      }),

      Job.countDocuments(),

      Application.countDocuments()
    ]);

    return res.json({
      summary: {
        students,
        recruiters,
        jobs,
        applications
      }
    });
  })
);

export default router;
