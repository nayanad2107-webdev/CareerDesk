import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Job from './src/models/Job.js';

try {
  await mongoose.connect(process.env.MONGO_URI);

  const student = await User.findOne({
    email: 'YOUR_STUDENT_EMAIL'
  }).select('name role department graduationYear cgpa');

  const job = await Job.findById('6af92c7dbf36df349b19e05c');

  console.log('\n========== STUDENT PROFILE ==========');
  console.log(student);

  console.log('\n========== JOB ELIGIBILITY ==========');
  console.log({
    title: job?.title,
    company: job?.company,
    eligibleDepartments: job?.eligibleDepartments,
    eligibleGraduationYears: job?.eligibleGraduationYears,
    minCgpa: job?.minCgpa
  });

} catch (error) {
  console.error(error.message);
} finally {
  await mongoose.disconnect();
}