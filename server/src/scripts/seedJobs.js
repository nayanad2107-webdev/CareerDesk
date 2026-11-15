
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';

const jobs = [
  {
    title: 'Software Engineer Intern',
    company: 'TechNova Solutions',
    description: 'Work with experienced engineers to develop scalable web applications using JavaScript, React and Node.js.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Hybrid',
    salary: '₹25,000/month',
    minCgpa: 7,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['JavaScript', 'React', 'Node.js'],
  },
  {
    title: 'Python Developer Intern',
    company: 'CodeBridge Technologies',
    description: 'Develop backend applications, REST APIs and database integrations using Python.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Remote',
    salary: '₹20,000/month',
    minCgpa: 6.5,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Python', 'Django', 'SQL'],
  },
  {
    title: 'Graduate Software Engineer',
    company: 'NextGen Systems',
    description: 'Join the engineering team to build and maintain enterprise software products.',
    location: 'Bengaluru',
    jobType: 'Full-time',
    workMode: 'On-site',
    salary: '₹8–12 LPA',
    minCgpa: 7,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Java', 'Python', 'DSA'],
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'WebCraft Technologies',
    description: 'Build frontend and backend features for modern web applications.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Hybrid',
    salary: '₹18,000/month',
    minCgpa: 6,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
  {
    title: 'Associate Software Engineer',
    company: 'Innovate Digital',
    description: 'Contribute to software development, testing and deployment activities.',
    location: 'Bengaluru',
    jobType: 'Full-time',
    workMode: 'On-site',
    salary: '₹6–9 LPA',
    minCgpa: 7,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Python', 'SQL', 'OOP'],
  },
  {
    title: 'Data Analyst Intern',
    company: 'DataSphere Analytics',
    description: 'Analyze datasets and create reports and dashboards for business teams.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Hybrid',
    salary: '₹15,000/month',
    minCgpa: 6,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Python', 'SQL', 'Excel'],
  },
  {
    title: 'Frontend Developer Intern',
    company: 'PixelWorks',
    description: 'Create responsive and accessible user interfaces for web products.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Remote',
    salary: '₹15,000/month',
    minCgpa: 6,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    title: 'Backend Developer',
    company: 'CloudEdge Technologies',
    description: 'Develop APIs, database services and reliable backend systems.',
    location: 'Bengaluru',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    salary: '₹9–14 LPA',
    minCgpa: 7,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Node.js', 'MongoDB', 'Express', 'REST API'],
  },
  {
    title: 'Software Testing Intern',
    company: 'QualityFirst Labs',
    description: 'Perform software testing, identify bugs and support quality assurance.',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'On-site',
    salary: '₹12,000/month',
    minCgpa: 6,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['Testing', 'Python', 'SQL'],
  },
  {
    title: 'Junior Web Developer',
    company: 'BrightTech Solutions',
    description: 'Build and maintain web applications with modern frontend technologies.',
    location: 'Bengaluru',
    jobType: 'Part-time',
    workMode: 'Remote',
    salary: '₹12,000/month',
    minCgpa: 6,
    eligibleDepartments: ['CSE', 'ISE', 'ECE', 'IT'],
    eligibleGraduationYears: [2027],
    skills: ['HTML', 'CSS', 'JavaScript'],
  }
];

try {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from server/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ isActive: true });

  if (!user) {
    throw new Error('No active user found. Register an account first.');
  }

  let added = 0;

  for (const data of jobs) {
    const result = await Job.updateOne(
      { title: data.title, company: data.company },
      {
        $setOnInsert: {
          ...data,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Open',
          createdBy: user._id
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) added++;
  }

  console.log(`Successfully added ${added} new sample jobs.`);
  console.log(`Total sample opportunities: ${jobs.length}`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
