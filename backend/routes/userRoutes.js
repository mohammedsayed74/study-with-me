const express = require(`express`);
const router = express.Router();
const controller = require(`../controllers/userControllers`);

router.post(`/login`,controller.loginUser);

router.post(`/signUp`,controller.signUpUser);


module.exports = router;