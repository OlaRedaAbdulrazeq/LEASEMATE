const express = require("express");
const router = express.Router();
const {
  getAllUnits,
  getUnit,
  addUnit,
  updateUnit,
  deleteUnit,
  deleteUnitImage,
  testDatabase,
  getMyUnits,
  getPendingUnitImages,
  reviewUnitImage,
  approveUnit,
  rejectUnit,
  approveAllUnitImages,
  rejectAllUnitImages,
} = require("../controllers/unit.controller");

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/role.middleware");

router
  .route("/")
  .get(getAllUnits) // Public access for viewing units
  .post(protect, checkRole("landlord"), upload.array("images", 5), addUnit); // Auth required for creating

router.get("/my-units", protect, checkRole("landlord"), getMyUnits);

router
  .route("/:id")
  .get(getUnit) // Public access for viewing individual units
  .patch(protect, checkRole("landlord"), upload.array("images", 5), updateUnit) // Auth required for updating
  .delete(protect, checkRole("landlord"), deleteUnit); // Auth required for deleting

router.delete("/:id/image", protect, checkRole("landlord"), deleteUnitImage);

// Admin endpoints for reviewing unit images
router.get("/admin/pending-images", protect, checkRole("admin"), getPendingUnitImages);
router.patch("/admin/review-image", protect, checkRole("admin"), reviewUnitImage);

// Admin endpoints for approving/rejecting units
router.post("/admin/approve-unit", protect, checkRole("admin"), approveUnit);
router.post("/admin/reject-unit", protect, checkRole("admin"), rejectUnit);

// Admin endpoints for approving/rejecting all images of a unit
router.post("/admin/approve-all-images", protect, checkRole("admin"), approveAllUnitImages);
router.post("/admin/reject-all-images", protect, checkRole("admin"), rejectAllUnitImages);

module.exports = router;