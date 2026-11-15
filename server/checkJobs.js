import 'dotenv/config';
import mongoose from 'mongoose';
import Job from './src/models/Job.js';
import User from './src/models/User.js';

try {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('\n========== RECRUITER ACCOUNTS ==========\n');

  const users = await User.find({})
    .select('name role')
    .lean();

  console.log(JSON.stringify(
    users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      role: user.role
    })),
    null,
    2
  ));

  console.log('\n========== ALL PUBLISHED JOBS ==========\n');

  const jobs = await Job.find({})
    .select('title company deadline status createdBy')
    .populate('createdBy', 'name role')
    .lean();

  console.log(JSON.stringify(
    jobs.map(job => ({
      title: job.title,
      company: job.company,
      deadline: job.deadline,
      status: job.status,
      recruiterId: job.createdBy?._id?.toString() || 'No recruiter found',
      recruiterName: job.createdBy?.name || 'Unknown',
      recruiterRole: job.createdBy?.role || 'Unknown'
    })),
    null,
    2
  ));

} catch (error) {
  console.error('Check failed:', error.message);
} finally {
  await mongoose.disconnect();
}