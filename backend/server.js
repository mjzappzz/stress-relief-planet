const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { testConnection } = require("./src/db/mysql");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/activities", require("./src/routes/activityRoutes"));
app.use("/api/progress", require("./src/routes/progressRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = Number(process.env.PORT || 5000);

testConnection()
  .then(() => {
    console.log("Connected to MySQL");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MySQL:", err);
    process.exit(1);
  });

module.exports = app;
