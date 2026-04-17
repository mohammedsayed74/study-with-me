const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  getStudentMyRatings,
  getStudentMyUploads,
  getHighestRatedFiles,
  getMostActiveContributors,
  getAllPendingUploads,
  rejectMaterial,
} = require('../controllers/dashboardControllers');

const router = express.Router();

// ─── Student routes ────────────────────────────────
router.get('/student/my-ratings', requireAuth, getStudentMyRatings);
router.get('/student/my-uploads', requireAuth, getStudentMyUploads);

// ─── Doctor / Instructor routes ────────────────────
router.get('/doctor/top-rated', requireAuth, getHighestRatedFiles);
router.get('/doctor/top-contributors', requireAuth, getMostActiveContributors);
router.get('/doctor/pending', requireAuth, getAllPendingUploads);
router.patch('/doctor/reject/:id', requireAuth, rejectMaterial);

module.exports = router;
