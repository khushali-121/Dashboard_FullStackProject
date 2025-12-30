const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "https://ums12.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("UMS Backend Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/programs", require("./routes/universityRoutes"));
app.use("/api/live-projects", require("./routes/liveProjectRoutes"));

module.exports = app;
