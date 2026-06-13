const { pool } = require("../db/mysql");

const findAll = async () => {
  const [rows] = await pool.execute(
    "SELECT type, name, description, icon FROM activities WHERE is_enabled = 1 ORDER BY sort_order ASC, id ASC"
  );
  return rows;
};

const replaceAll = async (activities) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM activities");
    for (const activity of activities) {
      await connection.execute(
        "INSERT INTO activities (type, name, description, icon, route_path, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [
          activity.type,
          activity.name,
          activity.description || null,
          activity.icon || null,
          activity.routePath || null,
          activity.sortOrder || 0
        ]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { findAll, replaceAll };
