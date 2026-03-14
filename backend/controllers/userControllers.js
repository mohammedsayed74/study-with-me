const User = require(`../models/User`);
const Material = require(`../models/Material`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);

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
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: `user logged in successfully !`,
      email: user.email,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: `something went wrong` });
  }
};

const signUpUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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

    const user = await User.create({ name, email, hashedPassword, role });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
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
  console.log("Profile route hit for user:", req.user?._id);
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

    // Password validation logic
    if (newPassword.length < 8 || newPassword.includes(' ') || newPassword.trim() !== newPassword) {
        return res.status(400).json({ message: 'Invalid new password format' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.hashedPassword = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, signUpUser, getUserProfile, resetPassword };
