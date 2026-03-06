const express = require('express');
const { createCourse, getCourse, getAllCourses, deleteCourse, updateCourse } = require('../controllers/courseControllers');
const requireAuth = require('../middleware/requireAuth'); 

const router = express.Router();

router.get('/allCourses', getAllCourses);
router.get('/:courseCode', getCourse);

router.post('/', requireAuth, createCourse);
router.delete('/:courseCode', requireAuth, deleteCourse);
router.put('/:courseCode', requireAuth, updateCourse);


module.exports = router;