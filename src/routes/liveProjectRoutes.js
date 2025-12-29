const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/liveProjectController");

//SPECIFIC ROUTES FIRST
router.get("/stats/dashboard", auth, ctrl.projectStats);
router.get("/:id/check", auth, ctrl.checkProjectCompletion);

//GENERAL ROUTES
router.get("/", auth, ctrl.getProjects);
router.get("/:id", auth, ctrl.getProjectById);
router.post("/", auth, ctrl.createProject);
router.put("/:id", auth, ctrl.updateProject);
router.delete("/:id", auth, ctrl.deleteProject);

module.exports = router;
