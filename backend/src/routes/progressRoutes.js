const express = require("express");
const Progress = require("../models/Progress");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const stats = await Progress.statsByActivity();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { activityType, duration, score, description } = req.body;
  try {
    const progress = await Progress.create({ activityType, duration, score, description });
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const progress = await Progress.findRecent(100);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
