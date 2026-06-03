const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// FIX: Original GET and POST had zero auth — anyone could list all users
// or create a user bypassing bcrypt. All routes now require a valid token
// and admin role since user management is an admin-only operation.
router.get(   "/",    verifyToken, authorizeRoles("admin"), userController.getUsers);
router.post(  "/",    verifyToken, authorizeRoles("admin"), userController.createUser);
router.put(   "/:id", verifyToken, authorizeRoles("admin"), userController.updateUser);
router.delete("/:id", verifyToken, authorizeRoles("admin"), userController.deleteUser);

module.exports = router;