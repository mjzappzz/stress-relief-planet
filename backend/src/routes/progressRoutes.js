const express = require("express");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const activities = await Activity.find({}, "type name");
    const stats = await Promise.all(activities.map(async (activity) => {
      const count = await Progress.countDocuments({ activityType: activity.type });
      return { type: activity.type, name: activity.name, count };
    }));
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { activityType, duration, score, description } = req.body;
  try {
    const progress = new Progress({ activityType, duration, score, description });
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find().sort({ createdAt: -1 }).limit(100);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
