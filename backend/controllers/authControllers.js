const User = require(`../models/User`);
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

    const validPassword =
      password.trim() === password &&
      !password.includes(` `) &&
      password.trim().length >= 8;

    const validEmail =
      email.trim() === email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail || !validPassword) {
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
      message: `user signed in successfully !`,
      email: user.email,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, signUpUser };
