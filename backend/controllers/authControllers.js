const User = require(`../models/User`);
const bcrypt = require(bcrypt);

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

    // give user JWT

    res.status(200).json({ message: `user logged in successfully !` });
  } catch (error) {
    res.status(500).json({ error: `something went wrong` });
  }
};

const signUpUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: `All fields are required` });
    }

    const alreadyExists = await User.findOne({ email });

    if (alreadyExists) {
      return res.status(400).json({ meesage: `invalid input , try again` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, hashedPassword });

    res.status(201).json({ message: `user signed up successfully !` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, signUpUser };
