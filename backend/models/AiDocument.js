const mongoose = require("mongoose");

const AiDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  roadmap: [
    {
      topic: String,
      description: String,
    }
  ],
  flashcards: [
    {
      question: String,
      answer: String,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("AiDocument", AiDocumentSchema);
