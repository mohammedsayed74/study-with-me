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
      defualt: `pending`,
    },
    pdfPublicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Material', materialSchema);