const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("UMS Backend Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/programs", require("./routes/universityRoutes"));
app.use("/api/live-projects", require("./routes/liveProjectRoutes"));

module.exports = app;
