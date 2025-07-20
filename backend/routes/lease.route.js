const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const leaseController = require("../controllers/lease.controller");

// Tenant creates lease request
router.post(
  "/create",
  [
    body("tenantId").notEmpty().withMessage("Tenant ID is required"),
    body("landlordId").notEmpty().withMessage("Landlord ID is required"),
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("startDate").notEmpty().withMessage("Start date is required"),
    body("endDate").notEmpty().withMessage("End date is required"),
    body("fullNameArabic").notEmpty().withMessage("Tenant Arabic name is required"),
    body("nationalId").notEmpty().withMessage("Tenant national ID is required"),
    body("address").notEmpty().withMessage("Tenant address is required"),
    body("phoneNumber").notEmpty().withMessage("Tenant phone is required")
  ],
  leaseController.createLeaseRequest
);

// Landlord approves lease
router.patch(
  "/:id/approve",
  [
    body("landlordFullNameArabic").notEmpty().withMessage("Landlord Arabic name is required"),
    body("landlordNationalId").notEmpty().withMessage("Landlord national ID is required"),
    body("landlordPhoneNumber").notEmpty().withMessage("Landlord phone is required"),
    body("landlordAddress").notEmpty().withMessage("Landlord address is required")
  ],
  leaseController.approveLease
);

// Landlord rejects lease
router.patch("/:id/reject", leaseController.rejectLease);

// Tenant cancels lease
router.patch("/:id/cancel", leaseController.cancelLease);

// Tenant updates details
router.patch(
  "/:id/update-tenant",
  [
    body("fullNameArabic").notEmpty().withMessage("Arabic name is required"),
    body("nationalId").notEmpty().withMessage("National ID is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("address").notEmpty().withMessage("Address is required")
  ],
  leaseController.updateTenantDetails
);

// Landlord updates details
router.patch(
  "/:id/update-landlord",
  [
    body("fullNameArabic").notEmpty().withMessage("Arabic name is required"),
    body("nationalId").notEmpty().withMessage("National ID is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("propertyAddress").notEmpty().withMessage("Property address is required"),
    body("rentAmount").isNumeric().withMessage("Rent amount must be a number"),
    body("depositAmount").isNumeric().withMessage("Deposit amount must be a number")
  ],
  leaseController.updateLandlordDetails
);

// Get lease by ID
router.get("/:id", leaseController.getLeaseById);

// Get all leases for a landlord (with optional status filter)
router.get("/landlord/:landlordId", leaseController.getLandlordLeases);

// Get all leases for a tenant (with optional status filter)
router.get("/tenant/:tenantId", leaseController.getTenantLeases);

// Get all leases (admin only) - with pagination and filters
router.get("/", leaseController.getAllLeases);


module.exports = router;