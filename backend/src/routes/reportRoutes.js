const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// FIX: Express matches routes top-to-bottom. Previously GET /:id was registered
// before /my-reports and /analytics/*, so those paths were captured as id="my-reports"
// and id="analytics" — hitting getReportById and returning a 404.
// Rule: ALL static paths must be declared before any parameterised path.

// --- Static paths first ---
router.get("/analytics/damaged-assets", reportController.getMostDamagedAssets);
router.get("/analytics/repair-time",    reportController.getAverageRepairTime);
router.get("/my-reports", verifyToken, authorizeRoles("repairer"), reportController.getMyReports);
router.get(
  "/my-submissions",
  verifyToken,
  authorizeRoles("reporter"),
  reportController.getMySubmissions
);
// FIX: GET /reports was unprotected — any anonymous request could list all reports.
router.get( "/",    verifyToken, reportController.getReports);
router.post("/",    verifyToken, reportController.createReport);

router.put("/:id/assign", verifyToken, authorizeRoles("admin"),              reportController.assignReport);
router.put("/:id/status", verifyToken, authorizeRoles("repairer", "admin"),  reportController.updateReportStatus);

// --- Parameterised path last ---
router.get("/:id", verifyToken, reportController.getReportById);

module.exports = router;