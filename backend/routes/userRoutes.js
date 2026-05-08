const express = require(`express`);
const router = express.Router();
const controller = require(`../controllers/userControllers`);
const requireAuth = require(`../middleware/requireAuth`);
const uploadProfile = require(`../middleware/profileUploadMiddleware`);

router.post(`/login`, controller.loginUser);
router.post(`/signUp`, controller.signUpUser);

router.get(`/profile`, requireAuth, controller.getUserProfile);
router.patch(`/reset-password`, requireAuth, controller.resetPassword);
router.post(`/toggle-follow`, requireAuth, controller.toggleFollowCourse);

router.get(`/favorite-materials`, requireAuth, controller.getFavoriteMaterials);
router.post(`/toggle-favorite-material`, requireAuth, controller.toggleFavoriteMaterial);
router.post(`/upload-profile-picture`, requireAuth, uploadProfile.single('image'), controller.uploadProfilePicture);
router.delete(`/profile-picture`, requireAuth, controller.deleteProfilePicture);

module.exports = router;