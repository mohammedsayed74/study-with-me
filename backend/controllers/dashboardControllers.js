const Material = require('../models/Material');
const User = require('../models/User');
const mongoose = require('mongoose');

// ─── Student Endpoints ───────────────────────────────────────────

const getStudentMyRatings = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const materials = await Material.find({ 'ratings.user': userId })
      .select('title courseCode ratings')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const result = materials.map((m) => {
      const myRating = m.ratings.find(
        (r) => r.user.toString() === userId.toString()
      );
      return {
        _id: m._id,
        title: m.title,
        courseCode: m.courseCode,
        score: myRating?.score || 0,
        ratedAt: myRating?.ratedAt || null,
      };
    });

    result.sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentMyUploads = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const materials = await Material.find({ uploadedBy: userId })
      .select('title courseCode createdAt status rejectionReason rejectionNote pdfUrl')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Doctor / Instructor Endpoints ───────────────────────────────

const getHighestRatedFiles = async (req, res) => {
  try {

    const materials = await Material.find({
      status: 'approved',
      totalRatings: { $gt: 0 },
    })
      .select('title courseCode averageRating totalRatings uploadedBy')
      .populate('uploadedBy', 'name')
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(3)
      .lean();

    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMostActiveContributors = async (req, res) => {
  try {

    const contributors = await Material.aggregate([
      {
        $group: {
          _id: '$uploadedBy',
          totalUploads: { $sum: 1 },
          approvedUploads: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
      { $sort: { approvedUploads: -1, totalUploads: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalUploads: 1,
          approvedUploads: 1,
          name: '$user.name',
          role: '$user.role',
        },
      },
    ]);

    res.status(200).json({ success: true, data: contributors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPendingUploads = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const materials = await Material.find({ status: 'pending' })
      .select('title courseCode createdAt pdfUrl uploadedBy')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectMaterial = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { rejectionReason, rejectionNote } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const material = await Material.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason,
        rejectionNote: rejectionNote || '',
      },
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Material rejected with feedback',
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentMyRatings,
  getStudentMyUploads,
  getHighestRatedFiles,
  getMostActiveContributors,
  getAllPendingUploads,
  rejectMaterial,
};
