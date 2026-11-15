import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const email = process.argv[2]?.toLowerCase();
if (!email) {
  console.error('Usage: npm run make-admin -- user@example.com');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) throw new Error('No account found with that email. Register first.');
  console.log(`${user.email} is now an admin.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
