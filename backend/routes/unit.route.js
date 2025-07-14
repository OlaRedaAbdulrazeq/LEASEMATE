const express = require("express");
const router = express.Router();
const {
  getAllUnits,
  getUnit,
  addUnit,
  updateUnit,
  deleteUnit,
  deleteUnitImage,
} = require("../controllers/unit.controller");

const upload = require("../middlewares/upload.middleware");

router.route("/")
  .get(getAllUnits)
  .post(upload.array("images", 5), addUnit);

router.route("/:id")
  .get(getUnit)
  .patch(upload.array("images", 5), updateUnit)
  .delete(deleteUnit);

router.delete("/:id/image", deleteUnitImage);

module.exports = router;
