const mongoose = require(`mongoose`);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      upperCase: true,
    },
    description: {
      type: String,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `User`,
      required: true,
    },
    department:{
      type:String,
      enum:[`Computer Science`,`Mathematics`,`Statistics`],
      required:true
    },
    year:{
      type:Number,
      enum:[1,2,3,4],
      required:true
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model(`Course`, courseSchema);
