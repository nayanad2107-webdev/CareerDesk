import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Job from './src/models/Job.js';

try {
  await mongoose.connect(process.env.MONGO_URI);

  const studentId = '6af86e1ce4a18197e2ed3e4b';
  const jobId = '6af92c7dbf36df349b19e05c';

  const student = await User.findById(studentId);
  const job = await Job.findById(jobId);

  if (!student || student.role !== 'student') {
    throw new Error('Student account not found.');
  }

  if (!job) {
    throw new Error('Job not found.');
  }

  if (!Number.isInteger(student.graduationYear)) {
    throw new Error('Please update your graduation year in your student profile first.');
  }

  const validYears = job.eligibleGraduationYears
    .filter(year => Number.isInteger(year));

  if (!validYears.includes(student.graduationYear)) {
    validYears.push(student.graduationYear);
  }

  job.eligibleGraduationYears = [...new Set(validYears)];

  await job.save();

  console.log('\n========== STUDENT PROFILE ==========');
  console.log({
    name: student.name,
    department: student.department,
    graduationYear: student.graduationYear,
    cgpa: student.cgpa
  });

  console.log('\n========== UPDATED JOB ELIGIBILITY ==========');
  console.log({
    job: job.title,
    eligibleDepartments: job.eligibleDepartments,
    eligibleGraduationYears: job.eligibleGraduationYears,
    minCgpa: job.minCgpa
  });

} catch (error) {
  console.error('ERROR:', error.message);
} finally {
  await mongoose.disconnect();
}