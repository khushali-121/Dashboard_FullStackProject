const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/universityController");

router.post("/", auth, ctrl.createProgram);
router.get("/", auth, ctrl.getPrograms);
router.put("/:id", auth, ctrl.updateProgram);
router.delete("/:id", auth, ctrl.deleteProgram);
router.get("/overview", auth, ctrl.programStats);

module.exports = router;
