const express = require("express");
const router  = express.Router();
const adminCtrl = require("../controllers/adminController");
const assetCtrl = require("../controllers/assetAdminController");
const { verifyToken }    = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All admin routes require valid token + admin role
router.use(verifyToken, authorizeRoles("admin"));

// ── Role requests ────────────────────────────────────────────────────────────
router.get( "/role-requests",         adminCtrl.getRoleRequests);
router.post("/role-requests/approve", adminCtrl.approveRoleRequests);
router.post("/role-requests/reject",  adminCtrl.rejectRoleRequests);

// ── Rooms ────────────────────────────────────────────────────────────────────
router.get(   "/rooms",              adminCtrl.getRooms);
router.post(  "/rooms",              adminCtrl.createRoom);
router.patch( "/rooms/:id",          adminCtrl.updateRoom);
router.delete("/rooms/:id",          adminCtrl.deleteRoom);
router.get(   "/rooms/:id/assets",   adminCtrl.getRoomAssets);

// ── Assets — BUG FIX: route param is :roomId not :id ────────────────────────
router.post(  "/rooms/:roomId/assets",     assetCtrl.createAsset);
router.patch( "/assets/:id/position",      assetCtrl.updateAssetPosition);
router.patch( "/assets/:id",               assetCtrl.updateAsset);
router.delete("/assets/:id",               assetCtrl.deleteAsset);

// ── Allowed domains ──────────────────────────────────────────────────────────
router.get(   "/domains",    adminCtrl.getDomains);
router.post(  "/domains",    adminCtrl.addDomain);
router.delete("/domains/:id",adminCtrl.deleteDomain);

module.exports = router;