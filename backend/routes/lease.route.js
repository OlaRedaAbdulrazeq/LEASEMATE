const express = require("express");
const router = express.Router();
const { 
  createLease, 
  getMyLease, 
  getMyLeases, 
  generateLeasePDF,
  rejectLease,
  acceptLease
} = require("../controllers/lease.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");
const { checkRole } = require("../middlewares/role.middleware.js");

// إنشاء عقد بناءً على bookingId (يملأه المالك)
router.post("/create/:bookingId", protect, checkRole("landlord"), createLease);

// جلب عقد المستأجر الحالي
router.get("/my-lease", protect, getMyLease);

// جلب كل عقود المستخدم
router.get("/my-leases", protect, getMyLeases);

// تحميل عقد الإيجار PDF
router.get("/:leaseId/pdf", protect, generateLeasePDF);

// رفض العقد من قبل المستأجر
router.patch("/:id/reject", protect, checkRole("tenant"), rejectLease);

// قبول العقد من قبل المستأجر
router.patch("/:id/accept", protect, checkRole("tenant"), acceptLease);

module.exports = router;
