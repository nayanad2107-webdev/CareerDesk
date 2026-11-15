import jwt from 'jsonwebtoken';
export const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
export const publicUser = (user) => ({
  _id: user._id, name: user.name, email: user.email, role: user.role,
  phone: user.phone, department: user.department, graduationYear: user.graduationYear,
  cgpa: user.cgpa, skills: user.skills, resumeUrl: user.resumeUrl, company: user.company
});
