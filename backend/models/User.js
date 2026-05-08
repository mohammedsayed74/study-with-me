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
    academicYear: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: function () {
        return this.role === "student";
      },
    },
    followedCourses: {
      type: [String],
      default: []
    },
    favoriteMaterials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    }],
    profilePicture: {
      type: String,
      default: ""
    },
    profilePicturePublicId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true },
);
module.exports = mongoose.model(`User`, userSchema);
