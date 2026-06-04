const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRooms);
router.get("/categories/types", roomController.getAssetTypes);
router.get("/:id/assets", roomController.getRoomAssets);

module.exports = router;