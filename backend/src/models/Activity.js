const { Schema, model } = require("mongoose");

const activitySchema = new Schema({
  type: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String }
});

module.exports = model("Activity", activitySchema);
