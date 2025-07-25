const express = require("express");
const { adminLogin, getUsers, updateVerificationStatus, getAbusiveUsers, blockUser } = require("../controllers/admin.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, admin, getUsers);
router.get("/users/abusive", protect, admin, getAbusiveUsers);
router.put("/users/:userId/verification", protect, admin, updateVerificationStatus);
router.put("/users/:userId/block", protect, admin, blockUser);

module.exports = router;
