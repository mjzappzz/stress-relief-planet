const { Schema, model } = require("mongoose");

const progressSchema = new Schema({
  activityType: { type: String, required: true, ref: "Activity" },
  duration: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("Progress", progressSchema);
