const mongoose = require("mongoose");

const AiChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiDocument",
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "model"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("AiChat", AiChatSchema);
