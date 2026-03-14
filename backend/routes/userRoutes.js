const express = require(`express`);
const router = express.Router();
const controller = require(`../controllers/userControllers`);
const requireAuth = require(`../middleware/requireAuth`);

router.post(`/login`, controller.loginUser);
router.post(`/signUp`, controller.signUpUser);

router.get(`/profile`, requireAuth, controller.getUserProfile);
router.patch(`/reset-password`, requireAuth, controller.resetPassword);

module.exports = router;