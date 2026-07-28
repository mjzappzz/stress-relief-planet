const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Activity = require('../models/Activity');

const activities = [
  { type: 'bubble', name: '泡泡纸', description: '戳破泡泡减压', icon: 'bubble' },
  { type: 'maze', name: '迷宫', description: '寻找出口', icon: 'maze' },
  { type: 'coloring', name: '绘画', description: '自由创作', icon: 'coloring' },
  { type: 'breathing', name: '呼吸', description: '4-7-8呼吸法', icon: 'breathing' },
  { type: 'piano', name: '钢琴', description: '弹奏音乐', icon: 'piano' }
];

async function seed() {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stress-relief';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD is required');
  }

  await mongoose.connect(mongodbUri);
  console.log('Connected to MongoDB');

  await Activity.deleteMany({});
  await Activity.insertMany(activities);
  console.log('Seeded activities');

  await User.deleteMany({});
  // 直接传明文密码，User 模型的 pre-save 钩子会自动加密
  const admin = new User({
    username: 'admin',
    email: 'admin@stressrelief.com',
    password: adminPassword
  });
  await admin.save();
  console.log('Created admin user');

  console.log('Seed completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
