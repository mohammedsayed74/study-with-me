const Material = require("../models/Material");
const Course = require("../models/Course");
const cloudinary = require(`cloudinary`).v2;

const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: `please provide a valid file format (.PDF)` });
    }

    const { title, courseCode } = req.body;

    if (!title || !courseCode) {
      return res
        .status(400)
        .json({ message: `title and course code must be provided` });
    }

    const pdfUrl = req.file.secure_url || req.file.path;
    const status = req.user.role === `teacher` ? `approved` : `pending`;
    const uploaderRole = req.user.role;

    const material = await Material.create({
      title,
      courseCode: courseCode.toUpperCase(),
      pdfUrl,
      pdfPublicId: req.file.public_id || req.file.filename,
      uploadedBy: req.user._id,
      uploaderRole,
      status: status,
    });

    res.status(201).json({
      success: true,
      message:
        status === `pending`
          ? `material uploaded successfully ! waiting for TA to approve !`
          : `material uploaded successfully !`,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedMaterials = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { page = 1, limit = 10, sort } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const limitNum = Number(limit);
    const skip = (currentPage - 1) * limitNum;

    const query = {
      courseCode: courseCode.toUpperCase(),
      status: `approved`,
    };

    let sortOptions = { uploaderRole: -1, createdAt: -1 };
    if (sort === "highestRated") {
      sortOptions = { averageRating: -1, totalRatings: -1 };
    } else if (sort === "mostRated") {
      sortOptions = { totalRatings: -1, averageRating: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const materials = await Material.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate(`uploadedBy`, `name`);

    const totalMaterials = await Material.countDocuments(query);

    res
      .status(200)
      .json({ 
        success: true, 
        count: materials.length, 
        totalMaterials,
        totalPages: Math.ceil(totalMaterials / limitNum) || 1,
        currentPage,
        data: materials 
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingMaterials = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const materials = await Material.find({
      courseCode: courseCode.toUpperCase(),
      status: `pending`,
    })
      .sort({ createdAt: 1 })
      .populate(`uploadedBy`, `name`);

    res
      .status(200)
      .json({ success: true, count: materials.length, data: materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByIdAndUpdate(
      id,
      { status: `approved` },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!material) {
      return res.status(404).json({ message: `Material does not exist !` });
    }

    res.status(200).json({
      success: true,
      message: `material approved and now visible for students !`,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaterial = await Material.findById(id);

    if (!deletedMaterial) {
      return res.status(404).json({ message: `Material does not exist !` });
    }

    await cloudinary.uploader.destroy(deletedMaterial.pdfPublicId);
    await Material.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Material deleted successfully !`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rateMaterial = async (req, res) => {
  try {
    const { score } = req.body;
    const materialId = req.params.id;
    const userId = req.user._id;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: `Invalid score !` });
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(400).json({ message: `Material not found` });
    }

    const ratingIndex = material.ratings.findIndex(
      (rating) => rating.user.toString() === userId.toString(),
    );

    if (!~ratingIndex) {
      material.ratings.push({ user: userId, score: +score });
    } else {
      material.ratings[ratingIndex].score = +score;
    }

    material.totalRatings = material.ratings.length;
    const totalScore = material.ratings.reduce(
      (ans, rating) => ans + rating.score,
      0,
    );
    material.averageRating =
      Math.round((totalScore / material.totalRatings) * 10) / 10;

    await material.save();

    res.status(200).json({
      success: true,
      message: `material rated successfully !`,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMaterials = async (req, res) => {
  try {
    const { keyword, department, year, sort, page = 1, limit = 10, courseCode } = req.query;

    let applyCourseFilter = false;
    let courseFilters = {};

    if (courseCode) {
      courseFilters.courseCode = courseCode.toUpperCase();
      applyCourseFilter = true;
    } else {
      if (department) {
        courseFilters.department = department;
        applyCourseFilter = true;
      }

      const targetYear = year || (req.user?.role === 'student' ? req.user.year : null);

      if (targetYear) {
        courseFilters.year = Number(targetYear);
        applyCourseFilter = true;
      }

      if (year) {
        courseFilters.year = Number(year);
        applyCourseFilter = true;
      }
    }

    let allowedCourseCodes = [];

    if (applyCourseFilter) {
      const matchingCourses =
        await Course.find(courseFilters).select("courseCode");

      if (matchingCourses.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: Number(page),
          data: [],
        });
      }

      allowedCourseCodes = matchingCourses.map((c) => c.courseCode);
    }

    let materialQuery = { status: "approved" };

    if (applyCourseFilter) {
      materialQuery.courseCode = { $in: allowedCourseCodes };
    }

    let keywordCourseCodes = [];

    if (keyword) {
      const keywordCourses = await Course.find({
        $or: [
          { description: { $regex: keyword, $options: "i" } },
          { courseCode: { $regex: keyword, $options: "i" } },
        ],
      }).select("courseCode");

      keywordCourseCodes = keywordCourses.map((c) => c.courseCode);
    }

    if (keyword) {
      materialQuery.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { courseCode: { $regex: keyword, $options: "i" } },
        { courseCode: { $in: keywordCourseCodes } },
      ];
    }

    let sortOptions = { uploaderRole:-1 , createdAt: -1 };

    if (sort === "highestRated") {
      sortOptions = { averageRating: -1, totalRatings: -1 };
    } else if (sort === "mostRated") {
      sortOptions = { totalRatings: -1, averageRating: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const currentPage = Math.max(Number(page), 1);
    const limitNum = Number(limit);
    const skip = (currentPage - 1) * limitNum;

    const materials = await Material.find(materialQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("uploadedBy", "name");

    const totalMaterials = await Material.countDocuments(materialQuery);

    res.status(200).json({
      success: true,
      count: materials.length,
      totalMaterials,
      totalPages: Math.ceil(totalMaterials / limitNum),
      currentPage,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMaterial,
  getApprovedMaterials,
  getPendingMaterials,
  approveMaterial,
  deleteMaterial,
  rateMaterial,
  searchMaterials
};
