const User = require(`../models/User`);
const Material = require(`../models/Material`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);
const cloudinary = require(`cloudinary`).v2;

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: `All fields are required` });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: `error , invalid email or password` });
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);

    if (!valid) {
      return res
        .status(400)
        .json({ message: `error , invalid email or password` });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: `user logged in successfully !`,
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message || `something went wrong` });
  }
};

const signUpUser = async (req, res) => {
  try {
    const { name, email, password, role, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: `All fields are required` });
    }

    const alreadyExists = await User.findOne({ email });

    if (alreadyExists) {
      return res.status(400).json({ message: `invalid input , try again` });
    }

    const validEmail =
      email.trim() === email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const validPassword =
      password.trim() === password &&
      !password.includes(` `) &&
      password.trim().length >= 8;

    if (!validPassword) {
      return res.status(400).json({ message: `invalid input , try again` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, hashedPassword, role, academicYear: role === 'student' ? Number(year) : undefined });

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: `user signed up successfully !`,
      email: user.email,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-hashedPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const materials = await Material.find({ uploadedBy: req.user._id });

    res.status(200).json({ user, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (newPassword.length < 8 || newPassword.includes(' ') || newPassword.trim() !== newPassword) {
      return res.status(400).json({ message: 'Invalid new password format' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, { hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFollowCourse = async (req, res) => {
  try {
    const { courseCode } = req.body;
    
    if (!courseCode) {
      return res.status(400).json({ message: 'Course code is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.followedCourses.includes(courseCode);
    
    let updatedUser;
    if (isFollowing) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { followedCourses: courseCode } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { followedCourses: courseCode } },
        { new: true }
      );
    }

    res.status(200).json({ 
      message: isFollowing ? 'Course unfollowed' : 'Course followed',
      followedCourses: updatedUser.followedCourses 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavoriteMaterial = async (req, res) => {
  try {
    const { materialId } = req.body;
    
    if (!materialId) {
      return res.status(400).json({ message: 'Material ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorited = user.favoriteMaterials.some(id => id.toString() === materialId.toString());
    
    let updatedUser;
    if (isFavorited) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favoriteMaterials: materialId } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favoriteMaterials: materialId } },
        { new: true }
      );
    }

    res.status(200).json({ 
      message: isFavorited ? 'Material removed from favorites' : 'Material added to favorites',
      favoriteMaterials: updatedUser.favoriteMaterials 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavoriteMaterials = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favoriteMaterials',
      populate: {
        path: 'uploadedBy',
        select: 'name'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ data: user.favoriteMaterials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (err) {
        console.error("Error deleting old profile picture from Cloudinary:", err);
      }
    }

    const profilePicture = req.file.secure_url || req.file.path;
    const profilePicturePublicId = req.file.filename || req.file.public_id;
    
    await User.findByIdAndUpdate(req.user._id, {
      profilePicture,
      profilePicturePublicId
    });

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (err) {
        console.error("Error deleting profile picture from Cloudinary:", err);
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      profilePicture: "",
      profilePicturePublicId: ""
    });

    res.status(200).json({ message: "Profile picture removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, signUpUser, getUserProfile, resetPassword, toggleFollowCourse, toggleFavoriteMaterial, getFavoriteMaterials, uploadProfilePicture, deleteProfilePicture };
