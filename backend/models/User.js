const mongoose = require(`mongoose`);
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    role: {
      type: String,
      enum: [`student`, `teacher`],
      default: `student`,
      required: true,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true },
);
module.exports = mongoose.model(`User`, userSchema);
