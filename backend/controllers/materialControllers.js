const Material = require('../models/Material');
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

    const pdfUrl = req.file.path;
    const status = req.user.role === `teacher` ? `approved`:`pending`;

    const material = await Material.create({
      title,
      courseCode: courseCode.toUpperCase(),
      pdfUrl,
      pdfPublicId: req.file.filename,
      uploadedBy: req.user._id,
      status:status
    });

    res.status(201).json({
      success: true,
      message: status === `pending` ? `material uploaded successfully ! waiting for TA to approve !`: `material uploaded successfully !`,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedMaterials = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const materials = await Material.find({
      courseCode: courseCode.toUpperCase(),
      status: `approved`,
    })
      .sort({ createdAt: -1 })
      .populate(`uploadedBy`, `name`);

    res
      .status(200)
      .json({ success: true, count: materials.length, data: materials });
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

module.exports = {
  uploadMaterial,
  getApprovedMaterials,
  getPendingMaterials,
  approveMaterial,
  deleteMaterial,
};
