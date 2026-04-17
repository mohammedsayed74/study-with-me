const mongoose = require(`mongoose`);

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      uppercase: true,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `User`,
      required: true,
    },
    status: {
      type: String,
      enum: [`pending`, `approved`, `rejected`],
      default: `pending`,
    },
    pdfPublicId: {
      type: String,
      required: true,
    },
    rejectionReason: {
      type: String,
      enum: [`duplicate`, `incomplete`, `not_appropriate`, `other`],
    },
    rejectionNote: {
      type: String,
      trim: true,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        ratedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    uploaderRole: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
      default: "student",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Material", materialSchema);
