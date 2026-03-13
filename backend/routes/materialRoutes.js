const express = require("express");
const {
  uploadMaterial,
  getApprovedMaterials,
  getPendingMaterials,
  approveMaterial,
  deleteMaterial,
} = require("../controllers/materialControllers");


const requireAuth = require("../middleware/requireAuth"); 
const upload = require("../middleware/uploadMiddleware"); 

const router = express.Router();


router.get("/:courseCode/pending", requireAuth, getPendingMaterials);
router.get("/:courseCode", requireAuth, getApprovedMaterials);

router.post(
  "/upload/:courseCode",
  requireAuth,
  upload.single("pdf"),
  uploadMaterial,
);


router.patch("/:id/approve", requireAuth, approveMaterial);


router.delete("/:id", requireAuth, deleteMaterial);

module.exports = router;
