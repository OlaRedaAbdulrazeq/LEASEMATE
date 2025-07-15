const express = require("express");
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", adminController.adminLogin);
router.get("/users", protect, admin, adminController.getUsers);
router.put("/users/:userId/verification", protect, admin, adminController.updateVerificationStatus);

module.exports = router;
