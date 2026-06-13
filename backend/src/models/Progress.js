const { pool } = require("../db/mysql");

const toApiProgress = (row) => ({
  id: row.id,
  activityType: row.activity_type,
  duration: row.duration,
  score: row.score,
  description: row.description,
  createdAt: row.created_at
});

const create = async ({ activityType, duration = 0, score = 0, description = null }) => {
  const [result] = await pool.execute(
    "INSERT INTO progress (activity_type, duration, score, description) VALUES (?, ?, ?, ?)",
    [activityType, duration, score, description]
  );
  const [rows] = await pool.execute(
    "SELECT id, activity_type, duration, score, description, created_at FROM progress WHERE id = ?",
    [result.insertId]
  );
  return toApiProgress(rows[0]);
};

const findRecent = async (limit = 100) => {
  const [rows] = await pool.execute(
    "SELECT id, activity_type, duration, score, description, created_at FROM progress ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows.map(toApiProgress);
};

const statsByActivity = async () => {
  const [rows] = await pool.execute(`
    SELECT a.type, a.name, COUNT(p.id) AS count
    FROM activities a
    LEFT JOIN progress p ON p.activity_type = a.type
    WHERE a.is_enabled = 1
    GROUP BY a.type, a.name, a.sort_order, a.id
    ORDER BY a.sort_order ASC, a.id ASC
  `);
  return rows.map((row) => ({
    type: row.type,
    name: row.name,
    count: Number(row.count)
  }));
};

const deleteAll = async () => {
  await pool.execute("DELETE FROM progress");
};

module.exports = {
  create,
  deleteAll,
  findRecent,
  statsByActivity
};
