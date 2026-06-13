const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("../db/mysql");
const Activity = require("../models/Activity");
const Progress = require("../models/Progress");

const activities = [
  { type: "bubble", name: "泡泡纸", description: "戳破泡泡减压", icon: "bubble", routePath: "/bubble", sortOrder: 10 },
  { type: "maze", name: "迷宫", description: "寻找出口", icon: "maze", routePath: "/maze", sortOrder: 20 },
  { type: "coloring", name: "绘画", description: "自由创作", icon: "coloring", routePath: "/coloring", sortOrder: 30 },
  { type: "breathing", name: "呼吸", description: "4-7-8呼吸法", icon: "breathing", routePath: "/breathing", sortOrder: 40 },
  { type: "piano", name: "钢琴", description: "弹奏音乐", icon: "piano", routePath: "/piano", sortOrder: 50 }
];

async function seed() {
  await testConnection();
  console.log("Connected to MySQL");

  await Progress.deleteAll();
  await Activity.replaceAll(activities);
  console.log("Seeded activities");

  const passwordHash = await bcrypt.hash("admin123", 10);
  await pool.execute("DELETE FROM users WHERE username = ?", ["admin"]);
  await pool.execute(
    "INSERT INTO users (username, email, password_hash, nickname) VALUES (?, ?, ?, ?)",
    ["admin", "admin@stressrelief.com", passwordHash, "admin"]
  );
  console.log("Created admin user");

  console.log("Seed completed!");
  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
