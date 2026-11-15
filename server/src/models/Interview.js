import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mode: { type: String, enum: ['Online', 'In-person'], default: 'Online' },
  meetingLink: { type: String, trim: true, default: '' },
  venue: { type: String, trim: true, default: '' },
  notes: { type: String, maxlength: 1000, default: '' }
}, { timestamps: true });
export default mongoose.model('Interview', interviewSchema);
