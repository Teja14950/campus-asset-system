const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/", reportController.createReport);
router.get("/", reportController.getReports);
router.put("/:id/assign",reportController.assignReport);
router.get("/analytics/damaged-assets",reportController.getMostDamagedAssets);
router.put("/:id/status",reportController.updateReportStatus);
router.get("/analytics/repair-time", reportController.getAverageRepairTime);
module.exports = router;