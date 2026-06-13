const express = require("express");
const { body, validationResult } = require("express-validator");
const { generateToken } = require("../utils/auth");
const User = require("../models/User");

const router = express.Router();

router.post("/register", [
  body("username").isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;
  try {
    let user = await User.findByEmail(email);
    if (user) return res.status(400).json({ error: "User already exists" });
    user = await User.findByUsername(username);
    if (user) return res.status(400).json({ error: "Username already exists" });
    user = await User.create({ username, email, password });
    const token = generateToken(user.id);
    res.status(201).json({ token, user: User.toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", [
  body("username").notEmpty().withMessage("用户名不能为空"),
  body("password").exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user || !(await User.comparePassword(user, password))) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }
    const token = generateToken(user.id);
    res.json({ token, user: User.toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
