const express = require("express");
const { adminLogin, getUsers, updateVerificationStatus, getSubscriptions, refundSubscription , getAbusiveUsers, blockUser } = require("../controllers/admin.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, admin, getUsers);
router.get("/users/abusive", protect, admin, getAbusiveUsers);
router.put("/users/:userId/verification", protect, admin, updateVerificationStatus);
router.put("/users/:userId/block", protect, admin, blockUser);
router.get("/subscriptions", protect, admin, getSubscriptions);
router.put("/subscriptions/:subscriptionId/refund", protect, admin, refundSubscription);

module.exports = router;
