import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },
  phone: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
  graduationYear: { type: Number, min: 2000, max: 2100 },
  cgpa: { type: Number, min: 0, max: 10 },
  skills: [{ type: String, trim: true }],
  resumeUrl: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
