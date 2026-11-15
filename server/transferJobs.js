import 'dotenv/config';
import mongoose from 'mongoose';
import Job from './src/models/Job.js';
import User from './src/models/User.js';

try {
  await mongoose.connect(process.env.MONGO_URI);

  const jobs = await Job.find({})
    .select('title company createdBy')
    .populate('createdBy', 'name role');

  console.log('\n========== ALL JOBS ==========');

  console.log(JSON.stringify(
    jobs.map(job => ({
      title: job.title,
      company: job.company,
      owner: job.createdBy?.name,
      role: job.createdBy?.role
    })),
    null,
    2
  ));

  console.log('\nTotal jobs:', jobs.length);

} catch (error) {
  console.error(error.message);
} finally {
  await mongoose.disconnect();
}