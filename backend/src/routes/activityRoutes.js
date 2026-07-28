const express = require("express");
const Activity = require("../models/Activity");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
