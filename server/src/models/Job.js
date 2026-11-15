import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 5000 },
  location: { type: String, required: true, trim: true },
  jobType: { type: String, enum: ['Full-time', 'Internship', 'Part-time'], default: 'Full-time' },
  workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
  salary: { type: String, default: 'Not disclosed' },
  minCgpa: { type: Number, min: 0, max: 10, default: 0 },
  eligibleDepartments: [{ type: String }],
  eligibleGraduationYears: [{ type: Number }],
  skills: [{ type: String, trim: true }],
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
