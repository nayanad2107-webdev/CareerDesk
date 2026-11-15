import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'], default: 'Applied' },
  coverLetter: { type: String, maxlength: 2000, default: '' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date
}, { timestamps: true });
applicationSchema.index({ student: 1, job: 1 }, { unique: true });
export default mongoose.model('Application', applicationSchema);
