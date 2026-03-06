const course = require(`../models/Course`);
const mongoose = require(`mongoose`);

const createCourse = async (req, res) => {
  try {
    const { title, courseCode, description } = req.body;
    if (!title || !courseCode || !description)
      res
        .status(400)
        .json({ message: `invalid title or course code , try again` });
    const courseExists = await course.findOne({ courseCode });
    if (courseExists) {
      res.status(400).json({ message: `course with this code already exists` });
    }
    const adminId = req.user._id;
    const newCourse = await course.create({
      title,
      courseCode,
      description,
      admin: adminId,
    });
    res
      .status(201)
      .json({
        success: true,
        message: `course created successfully`,
        data: newCourse,
      });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: `course with this code already exists` });
    }
    res.status(500).json({ message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await course
      .find({})
      .sort({ createdAt: -1 })
      .populate(`admin`, `name`);
    res
      .status(200)
      .json({
        success: true,
        message: `courses fetched successfully`,
        count: courses.length,
        data: courses,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const Course = await course
      .findOne({ courseCode })
      .populate(`admin`, `name`);
    if (!Course) {
      res.status(404).json({ success: false, message: `course not found` });
    }
    res
      .status(200)
      .json({
        success: true,
        message: `course fetched successfully`,
        data: Course,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { title, description } = req.body;
    const updatedCourse = await course.findOneAndUpdate(
      { courseCode },
      { title, description },
    );
    if (!updatedCourse) {
      res.status(404).json({ success: false, message: `course not found` });
    }
    res
      .status(200)
      .json({
        success: true,
        message: `course updated successfully`,
        data: updatedCourse,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const deletedCourse = await course.findOneAndDelete({ courseCode });
    if (!deletedCourse) {
      res.status(404).json({ success: false, message: `course not found` });
    }
    res
      .status(200)
      .json({
        success: true,
        message: `course deleted successfully`,
        data: deletedCourse,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
