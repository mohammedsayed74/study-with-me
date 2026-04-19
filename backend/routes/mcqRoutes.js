const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/requireAuth');

const {
    createQuestion,
    getQuizQuestions,
    verifyAnswer,
    updateQuestion,
    deleteQuestion,
    getCourseChapters
} = require('../controllers/mcqControllers');

router.use(requireAuth);

router.post('/', createQuestion);
router.get('/', getQuizQuestions);
router.get('/:courseCode/chapters', getCourseChapters);
router.post('/verify', verifyAnswer);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;