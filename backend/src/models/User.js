const bcrypt = require("bcryptjs");
const { pool } = require("../db/mysql");

const toPublicUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email
});

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT id, username, email, password_hash AS passwordHash FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const [rows] = await pool.execute(
    "SELECT id, username, email, password_hash AS passwordHash FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
};

const create = async ({ username, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );
  return { id: result.insertId, username, email };
};

const comparePassword = async (user, candidatePassword) => {
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

module.exports = {
  comparePassword,
  create,
  findByEmail,
  findByUsername,
  toPublicUser
};
