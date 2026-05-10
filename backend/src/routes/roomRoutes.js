const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/:id/assets", roomController.getRoomAssets);

module.exports = router;